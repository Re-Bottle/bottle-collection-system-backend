import { it, describe } from "mocha";
import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../src/index.js";

use(chaiHttp);
let webCookies: any;
let vendorId: any;

describe("Server", () => {
  it("Server Hello", function (done) {
    request
      .execute(app)
      .get("/")
      .then((res: any) => {
        expect(res).to.have.status(200);
        done();
      })
      .catch((err: any) => done(err));
  });
});

describe("Vendor Signup", () => {
  // Test case: Successfully create a new vendor
  it("should create a new vendor when valid data is provided", function (done) {
    let vendorData = {
      email: "test@vendor.com",
      password: "P@ssword123",
      name: "Test Vendor",
    };

    request
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

    request
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
describe("Vendor Login", () => {
  // Test case: Successfully login with correct credentials
  it("should login vendor when valid data is provided", (done) => {
    const vendorData = {
      email: "test@vendor.com",
      password: "P@ssword123",
    };

    request
      .execute(app)
      .post("/auth/loginVendor")
      .send(vendorData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        webCookies = res.header["set-cookie"];
        vendorId = res.body.id;
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

    request
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

    request
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

describe("Vendor Delete", () => {
  // Test case: Successfully delete vendor
  it("should delete vendor", (done) => {
    let vendorData = { vendorId };

    request
      .execute(app)
      .post("/auth/deleteVendor")
      .set("Cookie", webCookies)
      .send(vendorData)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("Vendor deleted successfully");

        done();
      });
  });
});

// Test suite for the claimDevice route
describe("Vendor Device Claim", () => {
  // Test case: Successfully login with correct credentials
  it("should claim device when valid data is provided", (done) => {
    const deviceData = {
      id: "TEST-001-PI-001-20250106-8b9c7d9f",
      vendorId,
      deviceName: "Test Device",
      deviceLocation: "Test Location",
      deviceDescription: "Test Description",
    };

    request
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
  it("shouldn't claim device when all required data is not provided", (done) => {
    const deviceData = {
      id: "TEST-001-PI-001-20250106-8b9c7d9f",
      vendorId,
    };

    request
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
describe("Vendor Get Devices", () => {
  // Test case: No devices found for the vendor
  it("should show no devices", (done) => {
    let deviceData = { vendorId: "Test" };
    request
      .execute(app)
      .post("/device/getDevices")
      .send(deviceData)
      .set("Cookie", webCookies)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").eql("No devices found");
        done();
      });
  });

  // Test case: Missing vendor ID
  it("should show vendor id is missing", (done) => {
    let deviceData = { vendorId: "" };
    request
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
});

describe("Edit Device", () => {
  //Test case: Device exists under the vendor
  it("should update the device details", (done) => {
    let deviceData = {
      id: "TEST-001-PI-001-20250106-8b9c7d9f",
      deviceName: "Test Device",
      deviceLocation: "Test Location",
      deviceDescription: "Test Description",
    };

    request
      .execute(app)
      .post("/device/editDevice")
      .set("Cookie", webCookies)
      .send(deviceData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("Device updated successfully");
        done();
      });
  });

  //Test case: Id is not sent
  it("should not update the device details as id is missing", (done) => {
    let deviceData = {
      deviceName: "Test Device",
      deviceLocation: "Test Location",
      deviceDescription: "Test Description",
    };

    request
      .execute(app)
      .post("/device/editDevice")
      .set("Cookie", webCookies)
      .send(deviceData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("Device ID missing");
        done();
      });
  });

  //Test case: Device name is not sent
  it("should not update the device details as device name is missing", (done) => {
    let deviceData = {
      id: "TEST-001-PI-001-20250106-8b9c7d9f",
      deviceLocation: "Test Location",
      deviceDescription: "Test Description",
    };

    request
      .execute(app)
      .post("/device/editDevice")
      .set("Cookie", webCookies)
      .send(deviceData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("Device name missing");
        done();
      });
  });

  //Test case: Device location is not sent
  it("should not update the device details as device location is missing", (done) => {
    let deviceData = {
      id: "TEST-001-PI-001-20250106-8b9c7d9f",
      deviceName: "Test Device",
      deviceDescription: "Test Description",
    };

    request
      .execute(app)
      .post("/device/editDevice")
      .set("Cookie", webCookies)
      .send(deviceData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("message")
          .eql("Device location missing");
        done();
      });
  });
});

describe("Delete Device", () => {
  // Test case: Device does not exist
  it("should return an error message", function (done) {
    let deviceData = {
      id: "TEST-001-PI-001-20250106",
    };

    request
      .execute(app)
      .post("/device/deleteDevice")
      .set("Cookie", webCookies)
      .send(deviceData)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message").eql("Device not found");
        done();
      });
  });

  // Test case: Device exists and can be deleted
  it("should return success message", (done) => {
    let deviceData = {
      id: "TEST-001-PI-001-20250106-8b9c7d9f",
    };

    request
      .execute(app)
      .post("/device/deleteDevice")
      .set("Cookie", webCookies)
      .send(deviceData)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("Device deleted successfully");
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
//         console.log(res);
//         expect(res).to.have.status(200);
//         expect(res.body)
//           .to.have.property("message")
//           .eql("Password reset successful");
//         done();
//       });
//   });
// });
