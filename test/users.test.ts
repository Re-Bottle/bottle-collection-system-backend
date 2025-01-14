import { it, describe } from "mocha";
import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../src/index.js";

use(chaiHttp);
let appCookies: any;

// Android Application
// Test suite for the register route for users
describe("User Signup", () => {
  // Test case: Successfully create
  it("should create a new user when valid data is provided", function (done) {
    let userData = {
      email: "user@test.com",
      password: "P@ssword123",
      name: "Test User",
    };
    request
      .execute(app)
      .post("/auth/signup")
      .send(userData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(201);
        expect(res.body)
          .to.have.property("message")
          .eql("User created successfully");
        done();
      });
  });
  // Test case: User already exists
  it("should create same user that exists", (done) => {
    let userData = {
      email: "user@test.com",
      password: "P@ssword123",
      name: "Test User",
    };
    request
      .execute(app)
      .post("/auth/signup")
      .send(userData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("User already exists");
        done();
      });
  });
  // Test case: Invalid signup attempt
  it("should not create a new user when invalid data is provided", (done) => {
    let userData = {
      email: "user@test.com",
      password: "",
      name: "Test User",
    };
    request
      .execute(app)
      .post("/auth/signup")
      .send(userData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("error")
          .eql("Missing required fields: email, password, and name");
        done();
      });
  });
  // Test case: Invalid signup attempt
  it("should not create a new user when invalid data is provided", (done) => {
    let userData = {
      email: "",
      password: "",
      name: "",
    };
    request
      .execute(app)
      .post("/auth/signup")
      .send(userData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("error")
          .eql("Missing required fields: email, password, and name");
        done();
      });
  });
});
// Test suite for the login route for users
describe("User Login", () => {
  // Test case: Successfully login with correct credentials
  it("should login user when valid data is provided", (done) => {
    let userData = {
      email: "user@test.com",
      password: "P@ssword123",
    };
    request
      .execute(app)
      .post("/auth/login")
      .send(userData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        appCookies = res.header["set-cookie"];
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").eql("Login successful");
        done();
      });
  });
  // Test case: Failed login with incorrect credentials
  it("should not login due to wrong credentials", (done) => {
    let userData = {
      email: "user@test.com",
      password: "Password1",
    };
    request
      .execute(app)
      .post("/auth/login")
      .send(userData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("Invalid credentials");
        done();
      });
  });
  // Test case: Failed login when user does not exist
  it("should not login as no such user exists", (done) => {
    let userData = {
      email: "user99@test.com",
      password: "Password1",
    };
    request
      .execute(app)
      .post("/auth/login")
      .send(userData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("User not found");
        done();
      });
  });
  // Test case: Failed login with missing data
  it("Should not login when input is missng/ incomplete", (done) => {
    let userData = {
      email: "user@test.com",
      password: "",
    };
    request
      .execute(app)
      .post("/auth/login")
      .send(userData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("error")
          .eql("Missing required fields: email and password");
        done();
      });
  });
});

// // Test suite for the logout route
describe("User Logout", () => {
  // Test case: Successfully logout
  it("should logout user", (done) => {
    request
      .execute(app)
      .post("/auth/logout")
      .set("Cookie", appCookies)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("Logged out successfully");
        done();
      });
  });
});
