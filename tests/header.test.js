const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("header has the correct text", async () => {
  const text = await page.getContentsOf("a.brand-logo");
  expect(text).toEqual("Blogster");
});

test("clicking login starts oauth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("when signed in, shows logout button", async () => {
  await page.login();
  const myBlogsText = await page.getContentsOf(
    "#root > div > div > nav > div > ul > li:nth-child(1) > a"
  );
  const logoutText = await page.getContentsOf('a[href="/auth/logout"]');

  expect(myBlogsText).toEqual("My Blogs");
  expect(logoutText).toEqual("Logout");
});
