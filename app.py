from flask import *
import mysql.connector
import json
import jwt
import datetime
from functools import wraps
import requests
import os
from dotenv import load_dotenv
load_dotenv()

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config['JSON_SORT_KEYS']=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
secretkey = os.getenv("secretkey")

def token_auth(func):
	@wraps(func)
	def auth(*args, **kwargs):
		token = request.cookies.get("token")
		if not token:
			return (jsonify(error = True, message = "token is missing"), 403)
		try:
			data = jwt.decode(token, secretkey, algorithms="HS256")
		except:
			return (jsonify(error = True, message = "token is invalid"), 403)
		return func(*args, **kwargs)
	return auth

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

# API
connection_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name = "tpe_trip_pool",
    pool_size = 5,
    pool_reset_session = True,
    host = "127.0.0.1",
    user = "root",
    password = os.getenv("mysql-password"),
    database = "tpe_trip"
)

# return error 500, TBD
@app.errorhandler(500)
def internal_error(error):
	return (jsonify(error = True, message = "internal server error"), 500)

@app.route("/api/attractions", methods=["GET"])
def api_attractions():
	try:
		connection_object = connection_pool.get_connection()
		my_cursor = connection_object.cursor()

		# fetch attraction data
		page = int(request.args.get("page"))
		keyword = request.args.get("keyword")
		first_half_query = "SELECT Attraction.*, GROUP_CONCAT(Attr_img.images) images FROM Attraction \
			INNER JOIN Attr_img ON Attraction.id = Attr_img.attr_id WHERE (Attr_img.type = 'jpg' OR Attr_img.type = 'png')"
		if keyword == None:
			second_half_query = "GROUP BY Attraction.id LIMIT %s,12;"
			my_cursor.execute(first_half_query + second_half_query, [page*12])	
		else:
			second_half_query = "AND (category like %s OR name like %s) GROUP BY Attraction.id LIMIT %s,12;"
			my_cursor.execute(first_half_query + second_half_query, [keyword, "%"+keyword+"%", page*12])	

		my_result = my_cursor.fetchall()
		row_headers = [x[0] for x in my_cursor.description] # get column name
		json_result = [] # store attraction data into json_result[]
		for result in my_result:
			json_result.append(dict(zip(row_headers,result)))
		for result in json_result: # change images url string to list
			result["images"] = result["images"].split(",")
		
		# fetch attraction count
		if keyword == None:
			count_query = "SELECT COUNT(*) FROM Attraction"
			my_cursor.execute(count_query)
		else:
			count_query = "SELECT COUNT(*) FROM Attraction WHERE category like %s OR name like %s"
			my_cursor.execute(count_query, [keyword, "%"+keyword+"%"])
		count_result = my_cursor.fetchone()
		sum = count_result[0]
		
		# check if there is next page
		if (page + 1) * 12 < sum: # the last item this page is item[(page+1)*12]. if last item index is < item count, return nextPage index
			page += 1
		elif sum <= (page + 1) * 12 and (page + 1) * 12 < sum + 12: # if last page, return nextPage index as Null
			page = None
		else: # hit EOF, return 500
			raise EOFError

		return jsonify(nextPage = page, data = json_result)

	except EOFError:
		return (jsonify(error = True, message = "no more data"), 500)

	finally:
		my_cursor.close()
		connection_object.close()

@app.route("/api/attraction/<id>", methods=["GET"])
def api_attraction(id):
	try:
		# fetch attraction data
		connection_object = connection_pool.get_connection()
		my_cursor = connection_object.cursor()
		my_query = "SELECT Attraction.*, GROUP_CONCAT(Attr_img.images) images FROM Attraction INNER JOIN Attr_img ON Attraction.id = Attr_img.attr_id WHERE Attraction.id = '%s' AND (Attr_img.type = 'jpg' OR Attr_img.type = 'png') GROUP BY Attraction.id;"
		my_cursor.execute(my_query, [int(id)])
		row_headers = [x[0] for x in my_cursor.description] # get column name
		my_result = my_cursor.fetchone()
		json_result = dict(zip(row_headers, my_result))
		json_result["images"] = json_result["images"].split(",") # change images url string to list
		return jsonify(data = json_result)

	except (ValueError, IndexError, TypeError) as error:
		return (jsonify(error = True, message = error.args[0]), 400)

	finally:
		my_cursor.close()
		connection_object.close()

@app.route("/api/categories", methods=["GET"])
def api_categories():
	try:
		connection_object = connection_pool.get_connection()
		my_cursor = connection_object.cursor()
		my_query = "SELECT DISTINCT category FROM Attraction;"
		my_cursor.execute(my_query)
		my_result = my_cursor.fetchall()
		# change the datatype into list
		str_result = [x[0] for x in my_result]
		return jsonify(data = str_result)

	finally:
		my_cursor.close()
		connection_object.close()

@app.route("/api/user", methods=["POST"])
def user_signup():
	name = request.json["name"]
	email = request.json["email"]
	password = request.json["password"]
	if name and email and password:
		try:
			connection_object = connection_pool.get_connection()
			my_cursor = connection_object.cursor()
			check_email_query = "SELECT id FROM User WHERE email = %s"
			my_cursor.execute(check_email_query, [email])
			check_email_result = my_cursor.fetchone()
			if check_email_result == None: 
				insert_query = "INSERT INTO User (name, email, password) VALUES (%s, %s, %s);"
				my_cursor.execute(insert_query, (name, email, password))
				connection_object.commit()	
			else:
				return (jsonify(error = True, message = "this email is used"), 400)
		except:
			return (jsonify(error = True, message = "internal server error"), 500)
		finally:
			my_cursor.close()
			connection_object.close()
		return (jsonify(ok = True), 200)

	else:
		return (jsonify(error = True, message = "the data is not filled out correctly"), 400)




@app.route("/api/user/auth", methods=["GET"])
@token_auth
def user_auth():
	try:
		connection_object = connection_pool.get_connection()
		my_cursor = connection_object.cursor()
		token = request.cookies.get("token")
		if not token:
			return (jsonify(data = None), 200)
		data = jwt.decode(token, secretkey, algorithms="HS256")
		user_id = data["id"]
		if user_id:
			my_query = "SELECT id, name, email FROM User WHERE id = %s"
			my_cursor.execute(my_query, [user_id])
			my_result = my_cursor.fetchone()
			row_headers = [x[0] for x in my_cursor.description]
			json_result = dict(zip(row_headers, my_result))
			return (jsonify(data = json_result), 200)
	except:
		return (jsonify(error = True, message = "internal server error"), 500)
	finally:
		my_cursor.close()
		connection_object.close()

@app.route("/api/user/auth", methods=["PUT"])
def user_login():
	email = request.json["email"]
	password = request.json["password"]
	if email and password:
		try: 
			connection_object = connection_pool.get_connection()
			my_cursor = connection_object.cursor()
			my_query = "SELECT id, name from User WHERE email = %s AND password = %s;"
			my_cursor.execute(my_query, (email, password))
			my_result = my_cursor.fetchone()
			if my_result == None:
				return (jsonify(error = True, message = "info is wrong"), 400)
			else:
				expiredLength = datetime.datetime.utcnow() + datetime.timedelta(days=7)
				token = jwt.encode({"id": my_result[0], "exp": expiredLength}, secretkey, algorithm="HS256")
				@after_this_request
				def set_cookie(resp):
					resp = make_response((jsonify(ok = True), 200))
					resp.set_cookie(key="token", value=token, expires=expiredLength, httponly=True)
					return resp
				return (jsonify(ok = True), 200)
		except:
			return (jsonify(error = True, message = "internal server error"), 500)
		finally:
			my_cursor.close()
			connection_object.close()
	else:
		return (jsonify(error = True, message = "info not filled"), 400)

@app.route("/api/user/auth", methods=["DELETE"])
def user_logout():
	try:
		@after_this_request
		def delete_cookie(resp):			
			resp.set_cookie(key="token", max_age=0)
			return resp
		return (jsonify(ok = True), 200)
	except:
		return (jsonify(error = True, message = "internal server error"), 500)

@app.route("/api/booking", methods=["GET"])
@token_auth
def booking_get():
	try:
		token = request.cookies.get("token")
		data = jwt.decode(token, secretkey, algorithms="HS256")
		user_id = data["id"]
		connection_object = connection_pool.get_connection()
		my_cursor = connection_object.cursor()
		my_query = "SELECT Attraction.id, Attraction.name, Attraction.address, Attr_img.images, Booking.date, Booking.time, Booking.price \
			FROM Attraction \
			INNER JOIN Attr_img ON Attraction.id = Attr_img.attr_id \
			INNER JOIN Booking ON Attraction.id = Booking.attr_id \
			WHERE Booking.user_id = %s ORDER BY Booking.id DESC LIMIT 0,1;"
		my_cursor.execute(my_query, [user_id])
		my_result = my_cursor.fetchone()
		if my_result  == None:
			return (jsonify(data = None), 200)
		else:
			row_headers = [x[0] for x in my_cursor.description]
			# convert the data format
			attraction_header = [row_headers[0], row_headers[1], row_headers[2], "image"]
			attraction_result = [my_result[0], my_result[1], my_result[2], my_result[3]]
			json_attraction = dict(zip(attraction_header, attraction_result))
			formatted_result = [json_attraction, my_result[4].strftime("%Y-%m-%d"), my_result[5], my_result[6]]
			formatted_headers = ["attraction", row_headers[4], row_headers[5], row_headers[6]]
			json_result = dict(zip(formatted_headers, formatted_result))
			return (jsonify(data = json_result), 200)
	except:
		return (jsonify(error = True, message = "internal server error"), 500)
	finally:
		my_cursor.close()
		connection_object.close()
	
@app.route("/api/booking", methods=["POST"])
def booking_post():
	try: 
		connection_object = connection_pool.get_connection()
		my_cursor = connection_object.cursor()
		token = request.cookies.get("token")
		data = jwt.decode(token, secretkey, algorithms="HS256")
		user_id = data["id"]
		attraction_id = request.json["attractionId"]
		date = request.json["date"]
		time = request.json["time"]
		price = request.json["price"]
		check_query = "SELECT * FROM Booking WHERE user_id = %s AND date = %s;"
		my_cursor.execute(check_query, (user_id, date))
		check_result = my_cursor.fetchone()
		if not check_result:
			print("here")
			book_query = "INSERT INTO Booking (attr_id, date, time, price, user_id) VALUES (%s, %s, %s, %s, %s);"
			my_cursor.execute(book_query, (attraction_id, date, time, price, user_id))
			connection_object.commit()
			return (jsonify(ok = True), 200)
		else:
			return (jsonify(error = True, message = "time slot conflict"), 400)
	except (ValueError, IndexError, TypeError) as error:
		return (jsonify(error = True, message = error.args[0]), 400)
	except:
		return (jsonify(error = True, message = "internal server error"), 500)
	finally:
		my_cursor.close()
		connection_object.close()

@app.route("/api/booking", methods=["DELETE"])
def booking_delete():
	try:
		connection_object = connection_pool.get_connection()
		my_cursor = connection_object.cursor()
		token = request.cookies.get("token")
		data = jwt.decode(token, secretkey, algorithms="HS256")
		user_id = data["id"]
		print(user_id)
		my_query = "DELETE FROM Booking WHERE user_id = %s ORDER BY Booking.id DESC LIMIT 1;"
		my_cursor.execute(my_query, [user_id])
		connection_object.commit()
		print("fine")
		return (jsonify(ok = True), 200)
	except:
		return (jsonify(error = True, message = "internal server error"), 500)
	finally:
		my_cursor.close()
		connection_object.close()

if __name__ == "__main__":
    app.run(host = "0.0.0.0", port = 3000, debug = True)