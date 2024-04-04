import {json} from '@remix-run/node'

let receivedData;
export async function loader({request}) {
    return json({
        data: receivedData
    },
    {
    headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
}

export async function action({request}) {
    const method = request.method;
    switch(method){
        case "POST":
            receivedData = await request.json()
            console.log("request POST", receivedData)
            return json({
                ok:true,
                msg:"POST from API"
            });
        case "PATCH":
            return json({
                ok:true,
                msg:"PATCH from API"
            });
        default:
            return new Response("Method Not Allowed", {status: 405});           
    }
}