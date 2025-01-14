import { it, describe } from "mocha";
import { expect, use } from "chai";
import chaiHttp from "chai-http";
import app from "../src/index.js";

let chai = use(chaiHttp);

describe("Device Register", () => {
  // Test case: Device is not yet Registered
  it("should create a new device as valid data is provided", function (done) {
    let deviceData = {
      id: "TEST-001-PI-001-20250106-8b9c7d9f",
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
      id: "TEST-001-PI-001-20250106-8b9c7d9f",
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
        done();
      });
  });
});
