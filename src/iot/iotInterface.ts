import { AttachThingPrincipalCommand, CreateKeysAndCertificateCommand, CreateKeysAndCertificateCommandOutput, CreateThingCommand, IoTClient } from "@aws-sdk/client-iot";

const IOT_POLICY_NAME = process.env.IOT_POLICY_NAME || "IoTDevicePolicy";

export class IOTProvider{
    private static instance: IOTProvider;
    private client: IoTClient;
    

      private constructor() {
        this.client = new IoTClient({
            region: process.env.AWS_REGION || "ap-south-1",
          });
      }
    
      public static getInstance(): IOTProvider {
        if (!IOTProvider.instance) {
          IOTProvider.instance = new IOTProvider();
        }
        return IOTProvider.instance;
      }

      async createThingWithCertificate (thingName: string): Promise<any> {
        try {
          // Step 1: Create keys and certificate
          const createKeysAndCertCommand = new CreateKeysAndCertificateCommand({
            setAsActive: false, // Activate the certificate
          });
      
          const certResponse: CreateKeysAndCertificateCommandOutput =
            await this.client.send(createKeysAndCertCommand);
      
          const { certificateArn, certificateId, certificatePem, keyPair } =
            certResponse;
          console.log("Certificate created successfully:", {
            certificateId,
            certificateArn,
          });
      
          // Step 2: Create an IoT Thing
          const createThingCommand = new CreateThingCommand({
            thingName, // Name of the Thing
          });
      
          const thingResponse = await this.client.send(createThingCommand);
          console.log("Thing created successfully:", thingResponse);
      
          // Step 3: Attach the certificate to the Thing
          const attachThingPrincipalCommand = new AttachThingPrincipalCommand({
            thingName,
            principal: certificateArn, // Attach the certificate ARN
          });
      
          await this.client.send(attachThingPrincipalCommand);
          console.log(`Certificate attached to Thing "${thingName}" successfully.`);
      
          return Promise.resolve({
            certificateId,
            certificateArn,
            certificatePem,
            keyPair,
          });
        } catch (error) {
          console.error("Error in creating Thing and attaching certificate:", error);
          return Promise.reject(error);
        }
      };
}