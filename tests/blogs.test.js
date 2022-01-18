const Page = require("./helpers/page");

let page;
let sampleInput = "asd";

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When logged in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("Can see blog create form", async () => {
    //   await page.waitFor("button.teal.btn-flat.right");
    const text = await page.getContentsOf("div.title > label");
    expect(text).toEqual("Blog Title");
  });

  describe("And submitting valid inputs", async () => {
    beforeEach(async () => {
      await page.type("div.title > input", sampleInput);
      await page.type("div.content > input", sampleInput);
      await page.click("button.teal.btn-flat.right");
    });
    test("Takes user to review screen", async () => {
      const saveButtonText = await page.getContentsOf(
        "button.green.btn-flat > i"
      );
      expect(saveButtonText).toEqual("email");
    });

    test("Saving blog adds to index page", async () => {
      await page.click("button.green.btn-flat.right");
      await page.waitFor("span.card-title");
      const titleText = await page.getContentsOf("span.card-title");
      const contentText = await page.getContentsOf("div.card-content > p");
      expect(titleText).toEqual(sampleInput);
      expect(contentText).toEqual(sampleInput);
    });
  });

  describe("And using invalid inputs", async () => {
    beforeEach(async () => {
      await page.click("button.teal.btn-flat.right");
    });
    test("the form shows an error message", async () => {
      const titleText = await page.getContentsOf(
        "#root > div > div > div > div > form > div.title > div"
      );
      const contentText = await page.getContentsOf(
        "#root > div > div > div > div > form > div.content > div"
      );
      expect(titleText).toEqual("You must provide a value");
      expect(contentText).toEqual("You must provide a value");
    });
  });
});

describe("User is not logged in", async () => {
  test("User cannot create blog posts", async () => {
    const result = await page.evaluate(async () => {
      const res = await fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "My Title", content: "My Content" }),
      });
      return res.json();
    });
    expect(result.error).toEqual("You must log in!");
  });
});
