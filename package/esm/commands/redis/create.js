import { cliffy } from "../../deps.js";
import { Command } from "../../util/command.js";
import { parseAuth } from "../../util/auth.js";
import { http } from "../../util/http.js";
export var Region;
(function (Region) {
    Region["us-west-1"] = "us-west-1";
    Region["us-west-2"] = "us-west-2";
    Region["us-east-1"] = "us-east-1";
    Region["us-central1"] = "us-central1";
    Region["eu-west-1"] = "eu-west-1";
    Region["eu-central-1"] = "eu-central-1";
    Region["ap-south-1"] = "ap-south-1";
    Region["ap-southeast-1"] = "ap-southeast-1";
    Region["ap-southeast-2"] = "ap-southeast-2";
    Region["ap-northeast-1"] = "ap-northeast-1";
    Region["sa-east-1"] = "sa-east-1";
})(Region || (Region = {}));
export const createCmd = new Command()
    .name("create")
    .description("Create a new redis database")
    .option("-n --name <string>", "Name of the database", { required: true })
    .type("region", new cliffy.EnumType(Region))
    .option("-r --region <string:region>", "Primary region of the database", {
    required: true,
})
    .option("--read-regions [regions...:region]", "Read regions of the database", {
    required: false,
})
    .example("global", "upstash redis create --name mydb --region=us-east-1")
    .example("with replication", "upstash redis create --name mydb --region=us-east-1 --read-regions=us-west-1 eu-west-1")
    .action(async (options) => {
    const authorization = await parseAuth(options);
    // if (!options.name) {
    //   if (options.ci) {
    //     throw new cliffy.ValidationError("name");
    //   }
    //   options.name = await cliffy.Input.prompt("Set a name for your database");
    // }
    // if (!options.region) {
    //   if (options.ci) {
    //     throw new cliffy.ValidationError("region");
    //   }
    //   options.region = (await cliffy.Select.prompt({
    //     message: "Select a region",
    //     options: Object.entries(Region).map(([name, value]) => ({
    //       name,
    //       value,
    //     })),
    //   })) as Region;
    // }
    const body = {
        name: options.name,
        region: "global",
        primary_region: options.region,
        read_regions: options.readRegions,
    };
    if (body.read_regions !== undefined && !Array.isArray(body.read_regions)) {
        throw new Error("--read_regions should be an array");
    }
    const db = await http.request({
        method: "POST",
        authorization,
        path: ["v2", "redis", "database"],
        body,
    });
    if (options.json) {
        console.log(JSON.stringify(db, null, 2));
        return;
    }
    console.log(cliffy.colors.brightGreen("Database has been created"));
    console.log();
    console.log(cliffy.Table.from(Object.entries(db).map(([k, v]) => [k.toString(), v.toString()])).toString());
    console.log();
    console.log();
    console.log("You can visit your database details page: " +
        cliffy.colors.yellow("https://console.upstash.com/redis/" + db.database_id));
    console.log();
    console.log("Connect to your database with redis-cli: " +
        cliffy.colors.yellow(`redis-cli --tls -u redis://${db.password}@${db.endpoint}:${db.port}`));
});
