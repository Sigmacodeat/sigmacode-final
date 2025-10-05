import { cliffy } from "../../deps.js";
import { Command } from "../../util/command.js";
import { parseAuth } from "../../util/auth.js";
import { http } from "../../util/http.js";
export const listCmd = new Command()
    .name("list")
    .description("list all your databases")
    .option("-e, --expanded <boolean:boolean>", "Show expanded information")
    .example("List", "upstash redis list")
    .action(async (options) => {
    const authorization = await parseAuth(options);
    const dbs = await http.request({
        method: "GET",
        authorization,
        path: ["v2", "redis", "databases"],
    });
    if (options.json) {
        console.log(JSON.stringify(dbs, null, 2));
        return;
    }
    // if (!options.expanded) {
    //   console.log(
    //     cliffy.Table.from(
    //       dbs.map((db) => [db.database_name, db.database_id]),
    //     ).toString(),
    //   );
    //   return;
    // }
    dbs.forEach((db) => {
        console.log();
        console.log();
        console.log(cliffy.colors.underline(cliffy.colors.brightGreen(db.database_name)));
        console.log();
        console.log(cliffy.Table.from(Object.entries(db).map(([k, v]) => [k.toString(), v.toString()])).toString());
        console.log();
    });
    console.log();
    console.log();
});
