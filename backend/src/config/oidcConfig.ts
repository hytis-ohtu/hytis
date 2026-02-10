/**
 * IN PRODUCTION: Configures Passport to use OpenID Connect for authenticationm, not used in development mode
 */

import { Issuer, Strategy as OpenIDStrategy } from "openid-client";
import passport from "passport";
import { config, isProduction } from "./environmentConfig";

interface UserInfo {
  sub: string;
  uid: string;
  name: string;
  email: string;
  given_name?: string;
  family_name?: string;
  cn?: string;
  hyGroupCn?: string;
}

const verifyLogin: any = async (
  req: any,
  tokenSet: any,
  userinfo: UserInfo,
  done: (err: any, user?: Express.User | false) => void,
) => {
  console.log("User logged in via OIDC:", userinfo.uid);
  console.log("User info:", userinfo);

  const user: Express.User = {
    id: userinfo.sub,
    uid: userinfo.uid,
    name: userinfo.name,
    email: userinfo.email,
  };

  // TODO: Store or update user in database if needed
  // await saveUserToDatabase(user);

  done(null, user);
};

export const configurePassport = async () => {
  if (!isProduction) {
    console.log("Passport OIDC configuration skipped (development mode)");
    return;
  }

  console.log("Configuring Passport with OIDC...");

  const { clientId, clientSecret, redirectUri, issuer } = config.oidc;

  if (!clientId || !clientSecret || !redirectUri || !issuer) {
    throw new Error(
      "Missing required OIDC environment variables: " +
        "OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI, OIDC_ISSUER",
    );
  }

  try {
    const oidcIssuer = await Issuer.discover(issuer);
    console.log("Discovered issuer:", oidcIssuer.metadata.issuer);

    const client = new oidcIssuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [redirectUri],
      response_types: ["code"],
    });

    const claimsObject = {
      cn: { essential: true },
      name: { essential: true },
      given_name: { essential: true },
      family_name: { essential: true },
      email: { essential: true },
      uid: { essential: true },
      hyGroupCn: { essential: false },
    };

    const params = {
      scope: "openid profile email",
      claims: {
        id_token: claimsObject,
        userinfo: claimsObject,
      },
    };

    passport.use(
      "oidc",
      new OpenIDStrategy(
        {
          client,
          params,
          passReqToCallback: false,
          usePKCE: false,
        },
        verifyLogin,
      ),
    );

    console.log("Passport OIDC configuration complete");
  } catch (error) {
    console.error("Failed to configure OIDC:", error);
    throw error;
  }
};
