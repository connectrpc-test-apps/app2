import * as http2 from 'http2';
import {Checker} from "./gen/app2_connect.js";
import {connectNodeAdapter, createGrpcTransport} from "@connectrpc/connect-node";
import {createPromiseClient} from "@connectrpc/connect";
import {CodeChecker} from "./gen/app3_connect.js";

const PORT = process.env.PORT || 3000;
const UPSTREAM_APP3 = process.env.UPSTREAM_APP3;

if (!UPSTREAM_APP3) {
    console.error("Upstream_APP3 port is required");
    process.exit(1);
}

const transport = createGrpcTransport({
    httpVersion: "2",
    baseUrl: `http://localhost:${UPSTREAM_APP3}`
})

const client = createPromiseClient(CodeChecker, transport);

const routes = (router) =>
    router.service(Checker, {
        async verify(req) {
            const {valid} = await client.printAndCheckIsCodeValid({code: req.code});
            return {
                valid: valid
            }
        }
    });

http2.createServer(connectNodeAdapter({
    routes
})).listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});