process.env.NODE_ENV = "test";
const server = require("../server");
const fs = require("fs");
const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const { describe } = require("mocha");
chai.use(chaiHttp);

let sellerId;
let token;
let productId;
let otp;

describe("Seller controller routes checking", () => {
  it("It should test add seller controller", (done) => {
    chai
      .request(server)
      .post("/api/sellers")
      .set("content-type", "multipart/form-data")
      .field("businessInformation[name]", "Example")
      .field("businessInformation[type]", "E-commerce")
      .field("businessInformation[gstRegistrationNumber]", "123ABC")
      .field("contactInformation[name]", "Tester")
      .field("contactInformation[email]", "tester@gmail.com")
      .field("contactInformation[phone]", "1234567890")
      .field("contactInformation[businessAddress]", "ABC street, India.")
      .field("bankAccountDetails[bankAccountNumber]", "789456123")
      .field("bankAccountDetails[ifscCode]", "7xyz12345")
      .field("bankAccountDetails[accountHolderName]", "Tester")
      .field("taxInformation[panCardDetails]", "abc123456")
      .field("taxInformation[gstin]", "qwerty")
      .attach(
        "legalDocuments[incorporationCertificate]",
        fs.readFileSync(`${__dirname}/headphone.jpg`),
        "headphone.jpeg"
      )
      .attach(
        "legalDocuments[partnershipDeed]",
        fs.readFileSync(`${__dirname}/headphone.jpg`),
        "headphone.jpeg"
      )
      .attach(
        "legalDocuments[otherDocuments]",
        fs.readFileSync(`${__dirname}/headphone.jpg`),
        "headphone.jpeg"
      )
      .attach(
        "identityProof[adhaarCardOrPassport]",
        fs.readFileSync(`${__dirname}/headphone.jpg`),
        "headphone.jpeg"
      )
      .attach(
        "identityProof[directorsOrPartnerIdentity]",
        fs.readFileSync(`${__dirname}/headphone.jpg`),
        "headphone.jpeg"
      )
      .field("password", "tester")
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(201);
        expect(res).to.be.an("Object");
        expect(res.body.message).to.be.equal("New seller added");
        expect(res.body.newSeller).to.be.an("Object");
        sellerId = res.body.newSeller._id;
        done();
      });
  });
  it("It should tests Send OTP controller", (done) => {
    chai
      .request(server)
      .post("/api/sellers/sendOtp")
      .send({
        email: "tester@gmail.com",
        password: "tester",
      })
      .set("Content-Type", "application/json")
      .set("accept", "application/json")
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body.message).to.be.equal("OTP sent to your Email.");
        // otp = res.body.updatedSeller.otp;
        done();
      });
  });
  it("It should tests Login Seller controller", (done) => {
    chai
      .request(server)
      .post("/api/sellers/login")
      .send({
        email: "tester@gmail.com",
        password: "tester",
        otp,
      })
      .set("Content-Type", "application/json")
      .set("accept", "application/json")
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body.message).to.be.equal("Seller logged in successfully");
        token = res.body.token;
        done();
      });
  });
  it("It should tests Get all seller controller", (done) => {
    chai
      .request(server)
      .get("/api/sellers")
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("Array");
        expect(res.body).to.have.length.greaterThan(0);
        done();
      });
  });
  it("It should tests Get seller by ID controller", (done) => {
    chai
      .request(server)
      .get(`/api/sellers/getSeller/${sellerId}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("Object");
        expect(res.body).to.have.keys([
          "_id",
          "bankAccountDetails",
          "businessInformation",
          "contactInformation",
          "identityProof",
          "legalDocuments",
          "taxInformation",
          "__v",
          "createdAt",
          "updatedAt",
          "password",
          "otp",
        ]);
        done();
      });
  });

  it("It should tests Logout Seller controller", (done) => {
    chai
      .request(server)
      .post("/api/sellers/logout")
      .set("authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body.message).to.be.equal("Logged Out succesfully");
        done();
      });
  });

  it("It will test add product controller", (done) => {
    chai
      .request(server)
      .post("/api/products")
      .send({
        name: "Product",
        description: "Amazing product",
        price: 3000,
      })
      .set("Content-Type", "application/json")
      .set("accept", "application/json")
      .set("authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(201);
        expect(res.body.message).to.be.equal("Product created successfully");
        expect(res.body).to.be.an("Object");
        productId = res.body.newProduct._id;
        done();
      });
  });
  it("It should test getProducts controller", (done) => {
    chai
      .request(server)
      .get("/api/products")
      .set("authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("Object");
        done();
      });
  });
  it("It should test Update Product controller", (done) => {
    chai
      .request(server)
      .put(`/api/products/update/${productId}`)
      .send({
        category: "Sports",
      })
      .set("Content-Type", "application/json")
      .set("accept", "application/json")
      .set("authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body.message).to.be.equal("Product updated successfully");
        expect(res.body).to.be.an("Object");
        done();
      });
  });
  it("It should test Get Product By Id controller", (done) => {
    chai
      .request(server)
      .get(`/api/products/${productId}`)
      .set("authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("Object");
        done();
      });
  });
  it("It should test Delete controller", (done) => {
    chai
      .request(server)
      .delete(`/api/products/${productId}`)
      .set("authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body.message).to.be.equal("Product deleted successfully");
        done();
      });
  });
  it.skip("It should tests Delete seller controller", (done) => {
    chai
      .request(server)
      .delete(`/api/sellers/${sellerId}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("Object");
        expect(res.body.message).to.be.equal("Seller deleted successfully.");
        done();
      });
  });
});
