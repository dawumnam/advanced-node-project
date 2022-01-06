const puppeteer = require("puppeteer");
const userFactory = require("../factories/userFactory");
const sessionFactory = require("../factories/sessionFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page, browser);
    return new Proxy(customPage, {
      get: function (target, property) {
        return browser[property] || page[property] || target[property];
      },
    });
  }
  constructor(page, browser) {
    this.page = page;
    this.browser = browser;
  }

  async login() {
    const user = await userFactory();
    const { session, sessionsig } = sessionFactory(user);

    await this.page.setCookie(
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
    await this.page.goto("http://localhost:3000/blogs");
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return await this.page.$eval(selector, (el) => el.innerHTML);
  }
}

module.exports = CustomPage;
