import { createRouter } from "@hattip/router";
import { renderPage } from "vite-plugin-ssr/server";
import { telefunc } from "telefunc";
import { VikeAuth } from "vike-authjs";
import CredentialsProvider from "@auth/core/providers/credentials";

const router = createRouter();

router.post("/_telefunc", async (context) => {
  const httpResponse = await telefunc({
    url: context.url.toString(),
    method: context.method,
    body: await context.request.text(),
    context,
  });
  const { body, statusCode, contentType } = httpResponse;
  return new Response(body, {
    status: statusCode,
    headers: {
      "content-type": contentType,
    },
  });
});
const Auth = VikeAuth({
  secret: "bibou",
  /**
   * Add your providers here
   *
   * @link {@see https://authjs.dev/guides/providers/custom-provider}
   * */
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const user = { id: "1", name: "J Smith", email: "jsmith@example.com" };

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
});

router.get("/api/auth/*", Auth);
router.post("/api/auth/*", Auth);

router.use(async (context) => {
  const pageContextInit = { urlOriginal: context.request.url };
  const pageContext = await renderPage(pageContextInit);
  const response = pageContext.httpResponse;

  return new Response(await response?.getBody(), {
    status: response?.statusCode,
    headers: response
      ? {
          "content-type": response.contentType,
        }
      : {},
  });
});

export default router.buildHandler();