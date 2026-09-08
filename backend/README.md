# IRONLOG — Gym Management Backend

This is the backend of **IRONLOG**, a gym management system I built to help gym owners manage members and monitor their memberships efficiently.

The backend is built with **Spring Boot** and **MySQL**. It provides REST APIs for the frontend and handles authentication, member data, filtering, and membership-related operations.

## Features

- Owner login with JWT authentication
- BCrypt password encryption
- Member management
- Search members by name
- Filter members by status, plan, gender, and age
- Age range filtering
- Recently joined members
- Expiring membership tracking
- Dashboard statistics

## API Endpoints

Owner Login
POST /auth/login

Get Members
GET /api/members

Search Members
GET /api/members/search

Filter by Status
GET /api/members/status

Filter by Plan
GET /api/members/plan

Filter by Gender
GET /api/members/gender

Filter by Age
GET /api/members/age

Filter by Age Range
GET /api/members/age-range

Recent Members
GET /api/members/recent

Expiring Members
GET /api/members/expiring

## Tech Stack

- Java
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- MySQL
- Maven

## Project Structure

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
    │   └── resources/
    │       └── application.properties
    └── test/

## Running the Backend

Configure the MySQL database in `application.properties` and run the Spring Boot application from IntelliJ IDEA.

The backend runs on:

`http://localhost:8080`

## Frontend

The backend is connected to the **IRONLOG frontend** through REST APIs. Authenticated requests use the JWT generated during owner login.

## Future Improvements

- Member registration and editing
- Membership renewal
- Payment management
- Attendance tracking
- Trainer management
- Additional dashboard analytics

## About

IRONLOG is a gym management project I built to make member and membership management simpler for gym owners.
