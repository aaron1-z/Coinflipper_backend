import amqp, { Channel, Options } from "amqplib";
import { config } from "../config/env-config";

let pubChannel: Channel | null = null;
let connected = false;

const exchange = config.amqpExchangeName;
console.log(config);

export const initQueue = async (): Promise<void> => {
    await connect();
};

export const connect = async (): Promise<void> => {
    if (connected && pubChannel) return;

    try {
        console.log("Connecting to Rabbit-MQ Server...");
        const connection = await amqp.connect(config.amqpConnectionString);
        console.log("Rabbit MQ Connection is ready");

        pubChannel = await connection.createChannel();

        await pubChannel.assertExchange(exchange, "x-delayed-message", {
            autoDelete: false,
            durable: true,
            arguments: { "x-delayed-type": "direct" },
        } as Options.AssertExchange);

        pubChannel.on("close", () => {
            console.error("[AMQP] Channel closed.");
            pubChannel = null;
            connected = false;
            setTimeout(initQueue, 5000); 
        });

        pubChannel.on("error", (err: unknown) => {
            console.error("[AMQP] Channel error:", err);
        });

        connection.on("error", (err) => {
             console.error("[AMQP] Top-Level Connection Error:", err);
        });
        
        console.log(`Created RabbitMQ Channel and asserted exchange '${exchange}' successfully`);
        connected = true;
    } catch (error: any) {
        console.error(`[AMQP] Failed to connect: ${error.message}`);
        console.log("[AMQP] Retrying connection in 5 seconds...");
        setTimeout(initQueue, 5000);
    }
};

export const sendToQueue = async (
    exchangeName: string,
    routingKey: string,
    message: string,
    delay: number = 0
): Promise<void> => {
    try {
        if (!pubChannel) {
            console.error("[AMQP] Channel not available. Message cannot be sent.");
            throw new Error("Publisher channel not initialized");
        }

        await pubChannel.assertQueue(routingKey, { durable: true });
        await pubChannel.bindQueue(routingKey, exchangeName, routingKey);

        pubChannel.publish(
            exchangeName,
            routingKey, 
            Buffer.from(message),
            {
                headers: { "x-delay": delay },
                persistent: true, 
            } as Options.Publish
        );

        console.log(
            `[AMQP] Message sent to queue '${routingKey}' on exchange '${exchangeName}'`
        );
    } catch (error: any) {
        console.error(
            `[AMQP] Failed to send message to queue '${routingKey}': ${error.message}`
        );
        throw error;
    }
};