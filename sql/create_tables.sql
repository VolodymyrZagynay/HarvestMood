-- Створення бази даних
CREATE DATABASE Harvest_Mood;
GO

USE Harvest_Mood;
GO

-- Користувачі
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    UserName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) CHECK (Role IN ('Farmer', 'Customer')) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- Категорії
CREATE TABLE Categories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL
);

-- Товари
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    FarmerId INT NOT NULL,
    CategoryId INT NOT NULL,
    ProductName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX),
    Price DECIMAL(10,2) NOT NULL,
    StockQuantity INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (FarmerId) REFERENCES Users(UserId),
    FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
);

-- Фото товарів
CREATE TABLE ProductImages (
    ImageId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

-- Замовлення
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL,
    OrderDate DATETIME2 DEFAULT GETDATE(),
    Status NVARCHAR(20) CHECK (Status IN ('Pending','Paid','Shipped','Completed','Cancelled')) NOT NULL DEFAULT 'Pending',
    TotalAmount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (CustomerId) REFERENCES Users(UserId)
);

-- Елементи замовлення
CREATE TABLE OrderItems (
    OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

-- Відгуки
CREATE TABLE Reviews (
    ReviewId INT IDENTITY(1,1) PRIMARY KEY,
    OrderItemId INT NOT NULL UNIQUE,
    Rating INT CHECK (Rating BETWEEN 1 AND 5) NOT NULL,
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (OrderItemId) REFERENCES OrderItems(OrderItemId)
);

---------------------------------------- користувач для сайту

CREATE LOGIN harvest_admin WITH PASSWORD = 'H@rv3stP@ss!';
GO

CREATE USER harvest_admin FOR LOGIN harvest_admin;
GO

EXEC sp_addrolemember 'db_owner', 'harvest_admin';
GO