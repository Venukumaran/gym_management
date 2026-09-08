IRONLOG — Gym Management Backend

This is the backend of IRONLOG, a gym management system that I built to help gym owners manage their members and keep track of membership activity in one place.

I developed the backend using Spring Boot, with MySQL for data storage and JWT authentication for securing the application. It provides the REST APIs used by my frontend and handles the main business logic of the gym management system.

What I Built

The backend is responsible for the core functionality of my gym management application, including:

Owner login and authentication

JWT-based security

Secure password handling using BCrypt

Member information management

Searching members by name

Filtering members by status, plan, gender, and age

Finding members within an age range

Viewing recently joined members

Tracking memberships that are expiring soon

Providing membership statistics for the owner dashboard

My goal was to keep the backend organized into separate layers so that authentication, business logic, database operations, and API handling are easier to maintain.

Project Structure

backend/
├── pom.xml
├── .mvn/
├── mvnw
├── mvnw.cmd
└── src/
    ├── main/
    │   ├── java/
    │   │   └── gym/
    │   │       └── demo/
    │   │           ├── controller/
    │   │           ├── service/
    │   │           ├── repositary/
    │   │           ├── config/
    │   │           └── ...
    │   │
    │   └── resources/
    │       └── application.properties
    │
    └── test/

The exact packages in my project may grow as I add more functionality, but I have kept the main application logic separated into appropriate layers.

Backend Architecture

I followed a layered approach while building the backend.

Controller

The controller layer exposes the REST APIs used by the frontend.

It receives requests, passes them to the appropriate service, and returns the required response.

Service

The service layer contains the main application logic.

This is where I handle operations such as member searching, filtering, membership-related checks, and authentication-related processing.

Repository

The repository layer handles communication with the database.

I use Spring Data JPA repositories to work with the stored member and owner information.

Configuration

The configuration classes handle application-level settings such as security, JWT processing, password configuration, and CORS.

Authentication and Security

I implemented owner authentication using JWT (JSON Web Token).

The login flow is:

The owner sends their email and password to the login API.

The backend verifies the credentials.

The password is checked using BCrypt.

If the credentials are valid, a JWT is generated.

The frontend sends this token with subsequent protected requests.

The JWT filter validates the token before allowing access to protected APIs.

Passwords are not stored as plain text. I use BCrypt to securely hash and verify owner passwords.

Owner Authentication API

The current version provides an owner login endpoint:

Feature

Method

Endpoint

Owner Login

POST

/auth/login

There is currently no public owner sign-up page. Owner accounts are expected to already exist in the database.

Member APIs

My backend provides APIs that the frontend uses to search, filter, and display member information.

Feature

Method

Endpoint

Get Members

GET

/api/members

Search by Name

GET

/api/members/search

Filter by Status

GET

/api/members/status

Filter by Plan

GET

/api/members/plan

Filter by Gender

GET

/api/members/gender

Filter by Age

GET

/api/members/age

Filter by Age Range

GET

/api/members/age-range

Recently Joined

GET

/api/members/recent

Expiring Memberships

GET

/api/members/expiring

These APIs are used by my frontend dashboard to display the appropriate member information based on the owner's search and filter selections.

Dashboard Support

The backend also provides the data needed for the owner dashboard.

The frontend uses the backend to display information such as:

Total members

Active members

Expired members

Members with memberships expiring soon

Recently joined members

This keeps the data and business logic on the backend while the frontend focuses on presenting the information to the gym owner.

Database

I use MySQL to store the application's data.

The backend uses Spring Data JPA and Hibernate to map Java entities to database tables and perform database operations.

The database currently contains the information required for:

Gym owners

Gym members

Membership-related details

CORS

I configured CORS so that my frontend can communicate with the Spring Boot backend while both applications are running separately during development.

This allows the frontend to make the required REST API requests to the backend.

Configuration

The main application and database configuration is located in:

src/main/resources/application.properties

The database connection details should be configured for the local MySQL environment before running the application.

I have not included any real database passwords or other sensitive credentials in this README.

Running the Backend

Prerequisites

Before running the backend, I need:

Java

MySQL

Maven, or the included Maven Wrapper

Using IntelliJ IDEA

I can open the backend project in IntelliJ IDEA and run the Spring Boot application from the main application class.

Using Maven Wrapper

On Windows:

mvnw.cmd spring-boot:run

On Linux or macOS:

./mvnw spring-boot:run

By default, the backend runs on:

http://localhost:8080

Frontend Integration

The backend is designed to work with my IRONLOG frontend.

The frontend communicates with the backend through REST APIs. After the owner logs in successfully, the JWT returned by the backend is used to access protected APIs.

The overall flow is:

IRONLOG Frontend
       |
       | REST API requests
       | JWT authentication
       ↓
Spring Boot Backend
       |
       | Spring Data JPA
       ↓
     MySQL

Technologies I Used

Java

Spring Boot

Spring Web

Spring Data JPA

Spring Security

JWT

BCrypt

Hibernate

MySQL

Maven

Current Scope

At the moment, I have focused the backend on the main requirements of a gym owner's dashboard:

Secure owner login

JWT authentication

Member data access

Member search

Member filtering

Membership status tracking

Expiring membership tracking

Recently joined members

Dashboard statistics

Future Improvements

As I continue developing IRONLOG, I would like to add:

Member creation and updating

Membership renewal

Payment and billing management

Attendance tracking

Trainer management

Gym profile management

More detailed dashboard analytics

Improved pagination for larger gyms

More advanced roles and permissions

About IRONLOG

IRONLOG is a gym management project that I built with the idea of making everyday gym management simpler for owners.

The backend is the core of the application. It handles authentication, business logic, database communication, and the REST APIs that connect the frontend with the stored gym data.
