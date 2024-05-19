process.env.NODE_ENV = "test";
const server = require("../server");
const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const { describe } = require("mocha");
chai.use(chaiHttp);

let token;


describe.skip("User Controller routes checking", () => {
  it.skip("It tests the register controller ", (done) => {
    chai
      .request(server)
      .post("/api/users")
      .send({
        firstName: "Test",
        lastName: "tester",
        userName: "tester",
        email: "tester@gmail.com",
        countryCode: "+91",
        phoneNumber: 1234567890,
        password: "test",
        status: "active",
        role: [],
      })
      .set("Content-Type", "application/json")
      .set("accept", "application/json")
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(201);
        expect(res.body.message).to.be.equal("User Created successfully.");
        expect(res.body).to.be.an("object");
        expect(res).to.not.have.status(400);
        done();
      });
  });
  it("It should test Login controller", (done) => {
    chai
      .request(server)
      .post("/api/users/login")
      .send({
        email: "tester@gmail.com",
        password: "test",
      })
      .set("Content-Type", "application/json")
      .set("accept", "application/json")
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res).to.not.have.status(400);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.be.equal("User logged in successfully");

        token = res.body.user.token;
        done();
      });
  });
  it.skip("It should test logout controller", (done) => {
    chai
      .request(server)
      .post("/api/users/logout")
      .set("authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        done();
      });
  });
  it.skip("It should test Get user controller", (done) => {
    chai
      .request(server)
      .get("/api/users/getUser")
      .set("authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        done();
      });
  });
  it.skip("It should test Get all user controller", (done) => {
    chai
      .request(server)
      .get("/api/users/getAllUsers")
      .set("authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res).to.not.have.status(404);
        expect(res.body).to.be.an("object");
        done();
      });
  });
  it.skip("It should test update user controller", (done) => {
    chai
      .request(server)
      .put("/api/users")
      .send({
        userName: "tester11",
      })
      .set("Content-Type", "application/json")
      .set("accept", "applicatio/json")
      .set("authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res).to.not.have.status(400);
        expect(res.body.message).to.be.equal("Profile updated successfully.");
        expect(res.body).to.have.property("updatedUser");
        done();
      });
  });
  it.skip("It should test update password controller", (done) => {
    chai
      .request(server)
      .put("/api/users/updatePassword")
      .send({
        currentPassword: "test",
        newPassword: "test1111",
      })
      .set("Content-Type", "application/json")
      .set("accept", "application/json")
      .set("authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res).to.not.have.status(401);
        expect(res.body.message).to.be.equal("Password updated successfully");
        done();
      });
  });
  it.skip("It should test delete User Controller", (done) => {
    chai
      .request(server)
      .put("/api/users/deleteUser/660bf1fab8363f9a8943b4bb")
      .set("authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res).not.to.have.status(404);
        expect(res.body.message).to.be.equal("User deleted successfully");
        done();
      });
  });
  it.skip("It should test forgot password controller", (done) => {
    chai
      .request(server)
      .post("/api/users/forgotPassword")
      .send({
        email: "tester@gmail.com",
      })
      .set("Content-Type", "application/json")
      .set("accept", "application/json")
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res.body.message).to.be.equal("Email sent");
        expect(res.body).to.be.an("object");
        done();
      });
  });
  it.skip("It should test reset password controller", (done) => {
    chai
      .request(server)
      .put(
        "/api/users/resetPassword/96998a6a51b98f7b4daccb89a07536a26ddc35403868b45efc994f8072d60529"
      )
      .send({
        password: "123456",
      })
      .set("Content-Type", "application/json")
      .set("accept", "application/json")
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res).to.have.status(200);
        expect(res).to.not.have.status(400);
        expect(res.body.message).to.be.equal("Password changed successfully.");
        done();
      });
  });
});

// describe.skip("Product Controller routes checking", () => {
//   it("It will test add product controller", (done) => {
//     chai
//       .request(server)
//       .post("/api/products")
//       .send({
//         name: "Product",
//         description: "Amazing product",
//         price: 3000,
//       })
//       .set("Content-Type", "application/json")
//       .set("accept", "application/json")
//       .set("authorization", `Bearer ${token}`)
//       .end((err, res) => {
//         if (err) {
//           console.log(err);
//         }
//         expect(res).to.have.status(201);
//         expect(res.body.message).to.be.equal("Product created successfully");
//         expect(res.body).to.be.an("Object");
//         productId = res.body.newProduct._id
//         done();
//       });
//   });
//   it("It should test getProducts controller", (done) => {
//     chai
//       .request(server)
//       .get("/api/products")
//       .end((err, res) => {
//         if (err) {
//           console.log(err);
//         }
//         expect(res).to.have.status(200);
//         expect(res.body).to.be.an("Object");
//         done();
//       });
//   });
//   it("It should test Update Product controller", (done) => {
//     chai
//       .request(server)
//       .put(`/api/products/update/${productId}`)
//       .send({
//         category: "Sports",
//       })
//       .set("Content-Type", "application/json")
//       .set("accept", "application/json")
//       .set("authorization", `Bearer ${token}`)
//       .end((err, res) => {
//         if (err) {
//           console.log(err);
//         }
//         expect(res).to.have.status(200);
//         expect(res.body.message).to.be.equal("Product updated successfully");
//         expect(res.body).to.be.an("Object");
//         done();
//       });
//   });
//   it("It should test Get Product By Id controller", (done) => {
//     chai.request(server).get(`/api/products/${productId}`).end((err, res) => {
//       if (err) {
//         console.log(err);
//       }
//       expect(res).to.have.status(200)
//       expect(res.body).to.be.an("Object")
//       done()
//     })
//   })
//   it.skip("It should test Delete controller", (done) => {
//     chai
//       .request(server)
//       .delete(`/api/products/${productId}`)
//       .set("authorization", `Bearer ${token}`)
//       .end((err, res) => {
//         if (err) {
//         console.log(err);
//         }
//         expect(res).to.have.status(200)
//         expect(res.body.message).to.be.equal("Product deleted successfully")
//         done()
//     })
//   });
// });
