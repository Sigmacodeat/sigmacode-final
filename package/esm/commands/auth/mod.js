import { Command } from "../../util/command.js";
import { loginCmd } from "./login.js";
import { logoutCmd } from "./logout.js";
import { whoamiCmd } from "./whoami.js";
const authCmd = new Command();
authCmd
    .description("Login and logout")
    .command("login", loginCmd)
    .command("logout", logoutCmd)
    .command("whoami", whoamiCmd);
authCmd.reset().action(() => {
    authCmd.showHelp();
});
export { authCmd };
