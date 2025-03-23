import { it, describe } from "mocha";
import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../src/index.js";

use(chaiHttp);
let id: string;

/*
// Create Reward
router.post("/createReward", createReward);

// Update Reward
router.put("/updateReward/:id", updateReward);

// Get Rewards
router.get("/getRewards", getRewards);

// Delete Reward
router.delete("/deleteReward/:id", deleteReward);
*/

describe("Create Reward", () => {
  // Test case: reward is created successfully
  it("should create a new reward as valid data is provided", function (done) {
    let data = {
      rewardName: "TestRewardName",
      rewardDescription: "TestRewardDescription",
      rewardPoints: 100,
      redeemBy: "TestDate",
    };

    request
      .execute(app)
      .post("/reward/createReward")
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        id = res.body.reward.id;
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("Reward created successfully");
        done();
      });
  });

  // Test case: Data is missing
  it("should return an error if data is missing", function (done) {
    let data = {
      rewardName: "TestRewardName",
      rewardDescription: "TestRewardDescription",
      rewardPoints: 100,
    };

    request
      .execute(app)
      .post("/reward/createReward")
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

describe("Update Reward", () => {
  // Test case: reward is updated successfully
  it("should update the reward as valid data is provided", function (done) {
    let data = {
      rewardName: "TestRewardName",
      rewardDescription: "TestRewardDescription",
      rewardPoints: 100,
      redeemBy: "TestDate",
    };

    request
      .execute(app)
      .put("/reward/updateReward/" + id)
      .send(data)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("Reward updated successfully");
        done();
      });
  });

  // Test case: Data is missing
  it("should return an error if data is missing", function (done) {
    let data = {
      rewardName: "TestRewardName",
      rewardDescription: "TestRewardDescription",
      rewardPoints: 100,
    };

    request
      .execute(app)
      .put("/reward/updateReward/" + id)
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

describe("Get Rewards", () => {
  // Test case: rewards are fetched successfully
  it("should fetch all rewards", function (done) {
    request
      .execute(app)
      .get("/reward/getRewards")
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("rewards");
        done();
      });
  });
});

describe("Delete Reward", () => {
  // Test case: reward is deleted successfully
  it("should delete the reward", function (done) {
    request
      .execute(app)
      .delete("/reward/deleteReward/" + id)
      .end((err: Error, res: any) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("Reward deleted successfully");
        done();
      });
  });
});
