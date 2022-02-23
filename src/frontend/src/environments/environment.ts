// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  url: "sivr.info:5000",
  toplevel_server: "sivr.info:5001",
  whitelist: ["sivr.info:5000", "sivr.info:5001", "sivr.info:5002", "sivr.info:5003"]
};
