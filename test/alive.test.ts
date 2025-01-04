import { it, describe } from "mocha";
import { expect, use } from "chai";
import chaiHttp from "chai-http";
import app from "../src/index.js";

const chai = use(chaiHttp);

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

describe("Failing Test", () => {
  it("Undefined Route", function (done) {
    chai.request
      .execute(app)
      .get("/test")
      .then((res: any) => {
        expect(res).to.have.status(404);
        done();
      })
      .catch((err: any) => done(err));
  });
});
