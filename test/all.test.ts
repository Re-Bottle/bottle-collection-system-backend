import { it, describe } from "mocha";
import { expect, use } from "chai";
import chaiHttp from "chai-http";
import app from "../src/index.js";

const chai = use(chaiHttp);
let webCookies: any;
let appCookies: any;
let resetToken: any;

describe("Healthy", () => {
  it("Server Hello", function (done) {
    chai.request
      .execute(app)
      .get("/")
      .then((res: any) => {
        expect(res).to.have.status(200);
        done();
      })
      .catch((err: any) => done(err));
  });
});

describe("POST /signupVendor", () => {
  // Test case: Successfully create a new vendor
  it("should create a new vendor when valid data is provided", function (done) {
    let vendorData = {
      email: "test@vendor.com",
      password: "P@ssword123",
      name: "Test Vendor",
    };

    chai.request
      .execute(app)
      .post("/auth/signupVendor")
      .send(vendorData)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(201);
        expect(res.body)
          .to.have.property("message")
          .eql("Vendor created successfully");
        done();
      });
  });

  // Test case: Vendor already exists
  it("should create same vendor that exists", (done) => {
    const vendorData = {
      email: "test@vendor.com",
      password: "P@ssword123",
      name: "Test Vendor",
    };

    chai.request
      .execute(app)
      .post("/auth/signupVendor")
      .send(vendorData)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("message")
          .eql("Vendor already exists");

        done();
      });
  });
});

// Test suite for the loginVendor route
describe("POST /loginVendor", () => {
  // Test case: Successfully login with correct credentials
  it("should login vendor when valid data is provided", (done) => {
    const vendorData = {
      email: "test@vendor.com",
      password: "P@ssword123",
    };

    chai.request
      .execute(app)
      .post("/auth/loginVendor")
      .send(vendorData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        webCookies = res.header["set-cookie"];
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").eql("Login successful");
        expect(res.body).to.have.property("email").eql(vendorData.email);
        expect(res.body).to.have.property("id").not.eql(null);
        expect(res.body).to.have.property("name").eql("Test Vendor");

        done();
      });
  });

  // Test case: Failing login with incorrect credentials
  it("shouldn't login vendor when invalid data is provided", (done) => {
    const vendorData = {
      email: "test@vendor.com",
      password: "Password123",
    };

    chai.request
      .execute(app)
      .post("/auth/loginVendor")
      .send(vendorData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("Invalid credentials");

        done();
      });
  });

  // Test case: Vender not found
  it("should give error when vendor does not exist", (done) => {
    const vendorData = {
      email: "test90@vendor.com",
      password: "P@ssword123",
    };

    chai.request
      .execute(app)
      .post("/auth/loginVendor")
      .send(vendorData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("Vendor not found");

        done();
      });
  });
});

describe("POST /register", () => {
  // Test case: Device is not yet Registered
  it("should create a new device as valid data is provided", function (done) {
    let deviceData = {
      deviceId: "TEST-001-PI-001-20250106-8b9c7d9f",
      macAddress: "00:14:22:01:23:45",
    };

    chai.request
      .execute(app)
      .post("/device/register")
      .send(deviceData)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("Device Created Successfully");
        expect(res.body).to.have.property("deviceState").eql("Registered");
        done();
      });
  });

  // Test case: Device is Registered but not yet provisioned
  it("should update the timestamp", (done) => {
    let deviceData = {
      deviceId: "TEST-001-PI-001-20250106-8b9c7d9f",
      macAddress: "00:14:22:01:23:45",
    };

    chai.request
      .execute(app)
      .post("/device/register")
      .send(deviceData)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("Device already exists. Timestamp updated.");
        expect(res.body).to.have.property("deviceState").eql("Registered");
        expect(res.body).to.have.property("timestamp").not.eql(null);
        done();
      });
  });
});

// Test suite for the claimDevice route
describe("POST /claimDevice", () => {
  // Test case: Successfully login with correct credentials
  it("should login vendor when valid data is provided", (done) => {
    const deviceData = {
      deviceId: "TEST-001-PI-001-20250106-8b9c7d9f",
      vendorId: "Test Vendor",
      deviceName: "Test Device",
      deviceLocation: "Test Location",
      deviceDescription: "Test Description",
    };

    chai.request
      .execute(app)
      .post("/device/claimDevice")
      .set("Cookie", webCookies)
      .send(deviceData)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("Device registration confirmed successfully.");
        expect(res.body).to.have.property("device").not.eql(null);
        done();
      });
  });

  // Test case: Not all inputs are given
  it("shouldn't login vendor when all required data is not provided", (done) => {
    const deviceData = {
      deviceId: "TEST-001-PI-001-20250106-8b9c7d9f",
      vendorId: "Test Vendor",
    };

    chai.request
      .execute(app)
      .post("/device/claimDevice")
      .send(deviceData)
      .set("Cookie", webCookies)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("message")
          .eql("Some parameters are missing");

        done();
      });
  });
});

// Test suite for the getDevices route
describe("POST /getDevices", () => {
  // Test case: Successfully get all devices
  it("should get all devices", (done) => {
    let deviceData = { vendorId: "Test Vendor" };
    chai.request
      .execute(app)
      .post("/device/getDevices")
      .send(deviceData)
      .set("Cookie", webCookies)
      .end((err: Error, res: any) => {
        console.log(res.body);
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("devices").not.eql(null);
        done();
      });
  });

  // Test case: Missing vendor ID
  it("should show vendor id is missing", (done) => {
    let deviceData = { vendorId: "" };
    chai.request
      .execute(app)
      .post("/device/getDevices")
      .send(deviceData)
      .set("Cookie", webCookies)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("Vendor ID missing");
        done();
      });
  });

  // Test case: No devices found for the vendor
  it("should show no devices", (done) => {
    let deviceData = { vendorId: "Test" };
    chai.request
      .execute(app)
      .post("/device/getDevices")
      .send(deviceData)
      .set("Cookie", webCookies)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message").eql("No devices found");
        done();
      });
  });
});

// Android Application
// Test suite for the register route for users
describe("POST /signup", () => {
  // Test case: Successfully create
  it("should create a new user when valid data is provided", function (done) {
    let userData = {
      email: "user@test.com",
      password: "P@ssword123",
      name: "Test User",
    };
    chai.request
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
    chai.request
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
    chai.request
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
    chai.request
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
describe("POST /login", () => {
  // Test case: Successfully login with correct credentials
  it("should login user when valid data is provided", (done) => {
    let userData = {
      email: "user@test.com",
      password: "P@ssword123",
    };
    chai.request
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
    chai.request
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
    chai.request
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
    chai.request
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
describe("POST /logout", () => {
  // Test case: Successfully logout
  it("should logout user", (done) => {
    chai.request
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

// // Test suite for the forgotPassword route
// describe("POST /forgotPassword", () => {
//   // Test case: Successfully request password reset
//   it("should send password reset link", (done) => {
//     let userData = {
//       email: "user@test.com",
//     };
//     chai.request
//       .execute(app)
//       .post("/auth/forgotPassword")
//       .send(userData)
//       .end((err: Error, res: any) => {
//         if (err) return done(err);
//         resetToken = res.body.resetToken;
//         expect(res).to.have.status(200);
//         expect(res.body)
//           .to.have.property("message")
//           .eql("Password reset token sent");
//         expect(res.body).to.have.property("resetToken").not.eql(null);
//         done();
//       });
//   });

//   // Test case: Email empty
//   it("should not send password reset link as email is empty", (done) => {
//     let userData = {
//       email: "",
//     };
//     chai.request
//       .execute(app)
//       .post("/auth/forgotPassword")
//       .send(userData)
//       .end((err: Error, res: any) => {
//         if (err) return done(err);
//         expect(res).to.have.status(400);
//         expect(res.body).to.have.property("message").eql("Email is required");
//         done();
//       });
//   });

//   // Test case: user does not exist
//   it("should not send password reset link as email is empty", (done) => {
//     let userData = {
//       email: "user90@test.com",
//     };
//     chai.request
//       .execute(app)
//       .post("/auth/forgotPassword")
//       .send(userData)
//       .end((err: Error, res: any) => {
//         if (err) return done(err);
//         expect(res).to.have.status(400);
//         expect(res.body).to.have.property("message").eql("User not found");
//         done();
//       });
//   });
// });

// // Test suite for the resetPassword route
// describe("POST /resetPassword", () => {
//   // Test case: Successfully reset password
//   it("should reset password", (done) => {
//     let userData = {
//       resetToken: resetToken,
//       newPassword: "P@ssw0rd",
//     };
//     chai.request
//       .execute(app)
//       .post("/auth/resetPassword")
//       .send(userData)
//       .end((err: Error, res: any) => {
//         if (err) return done(err);
//         console.log(res.body);
//         expect(res).to.have.status(200);
//         expect(res.body)
//           .to.have.property("message")
//           .eql("Password reset successful");
//         done();
//       });
//   });
// });
