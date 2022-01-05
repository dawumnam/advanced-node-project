const puppeteer = require("puppeteer");
const sessionFactory = require("./factories/sessionFactory");
const userFactory = require("./factories/userFactory");

let browser, page;

beforeEach(async () => {
  session = browser = await puppeteer.launch({
    headless: true,
  });
  page = await browser.newPage();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await browser.close();
});

test("header has the correct text", async () => {
  const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  expect(text).toEqual("Blogster");
});

test("clicking login starts oauth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("when signed in, shows logout button", async () => {
  const user = await userFactory();
  const { session, sessionsig } = sessionFactory(user);
  await page.setCookie(
    {
      name: "session",
      value: session,
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 10,
    },
    {
      name: "session.sig",
      value: sessionsig,
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 10,
    }
  );

  await page.goto("http://localhost:3000");
  await page.waitFor('a[href="/auth/logout"]');

  const myBlogsText = await page.$eval(
    "#root > div > div > nav > div > ul > li:nth-child(1) > a",
    (el) => el.innerHTML
  );
  const logoutText = await page.$eval(
    'a[href="/auth/logout"]',
    (el) => el.innerHTML
  );

  expect(myBlogsText).toEqual("My Blogs");
  expect(logoutText).toEqual("Logout");
});
