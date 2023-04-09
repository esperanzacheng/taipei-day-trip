# FROM python:3.10-alpine
# COPY . /taipei-day-trip
# WORKDIR /taipei-day-trip
# CMD [ "python3", "app.py" ]

# FROM python:3.9-alpine as base
# FROM base as builder
# COPY requirements.txt /requirements.txt
# RUN pip3 install --user -r /requirements.txt

# FROM base
# # copy only the dependencies installation from the 1st stage image
# COPY --from=builder /root/.local /root/.local
# COPY . /taipei-day-trip
# WORKDIR /taipei-day-trip

# CMD [ "python3", "app.py" ]

# Use an official Python runtime as a parent image
FROM python:3.9-alpine

# Set the working directory to /app
WORKDIR /taipei-day-trip

# Copy the current directory contents into the container at /app
COPY . /taipei-day-trip

# Install any needed packages specified in requirements.txt
RUN pip install --user -r requirements.txt

# Make port 80 available to the world outside this container
# EXPOSE 3000

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["python3", "app.py"]