import { it, describe } from "mocha";
import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../src/index.js";

use(chaiHttp);
let scanId: string;

describe("Create Scan", () => {
  // Test case: scan is created successfully
  it("should create a new scan as valid data is provided", function (done) {
    let data = {
      deviceId: "TestDeviceId",
      scanData: "TestScanData",
      bottleType: "LITRE1",
    };

    request
      .execute(app)
      .post("/scan/createScan")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        scanId = res.body.scan.id;
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.nested.property("scan.claimedBy")
          .eql("unclaimed");
        done();
      });
  });

  // Test case: Data is missing
  it("should return an error if data is missing", function (done) {
    let data = {
      deviceId: "Test_device_id",
      scanData: "Test_scan_data",
    };

    request
      .execute(app)
      .post("/scan/createScan")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("message")
          .eql("Missing required fields");
        done();
      });
  });
});

describe("Claim Scan", () => {
  // Test case: scan must be claimed within 10 minutes
  it("should claim the scan", function (done) {
    let data = {
      claimedBy: "Test User",
      scanData: "TestScanData",
    };

    request
      .execute(app)
      .put("/scan/claimScan")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("Scan has been claimed");
        expect(res.body)
          .to.have.nested.property("scan.claimedBy")
          .not.eql("unclaimed");
        done();
      });
  });

  // Test case: Data is missing
  it("should return an error if data is missing", function (done) {
    let data = {
      claimedBy: "Test User",
    };

    request
      .execute(app)
      .put("/scan/claimScan")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("message")
          .eql("Missing required fields");
        done();
      });
  });

  it("User does not have scans", function (done) {
    let data = {
      claimedBy: "Test User",
      scanData: "Non_existent_scan_data",
    };

    request
      .execute(app)
      .put("/scan/claimScan")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(404);
        done();
      });
  });

  it("should return an error when scan is not present in the database", function (done) {
    let data = {
      claimedBy: "Test User",
      scanData: "Non_existent_scan_data",
    };

    request
      .execute(app)
      .put("/scan/claimScan")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(404);
        done();
      });
  });

  it("should return an error when scan is already claimed", function (done) {
    let data = {
      claimedBy: "Test User2",
      scanData: "TestScanData",
    };

    request
      .execute(app)
      .put("/scan/claimScan")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("message")
          .eql("Scan has already been claimed");
        done();
      });
  });
});

// getScansByUser;
describe("Get Lists of Scans by User", () => {
  // Test case: Scans by valid user
  it("should return a list of scans for a valid user", function (done) {
    let data = {
      userId: "Test User",
    };

    request
      .execute(app)
      .post("/scan/getScansByUser")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("scans");
        done();
      });
  });

  // Test case: Data is missing
  it("should return an error if data is missing", function (done) {
    let data = {};

    request
      .execute(app)
      .post("/scan/getScansByUser")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("User ID missing");
        done();
      });
  });

  // Test case: No scans found for a valid user
  it("should return a 204 status and an empty scans array when no scans are found", function (done) {
    let data = {
      userId: "Dummy User",
    };

    request
      .execute(app)
      .post("/scan/getScansByUser")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res.status).to.equal(204);
        done();
      });
  });
});

// Delete the scan
describe("Delete Scan", () => {
  it("should delete the scan", function (done) {
    let data = {
      scanId: scanId,
    };
    request
      .execute(app)
      .delete("/scan/deleteScan")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").eql("Scan deleted");
        done();
      });
  });

  it("should return an error if data is missing", function (done) {
    let data = {};

    request
      .execute(app)
      .delete("/scan/deleteScan")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("Scan ID missing");
        done();
      });
  });

  it("should return an error when scan is not present in the database", function (done) {
    let data = {
      scanId: scanId,
    };

    request
      .execute(app)
      .delete("/scan/deleteScan")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);
        expect(res).to.have.status(404);
        done();
      });
  });
});
