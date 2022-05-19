// eslint-disable-next-line unused-imports/no-unused-imports-ts
import * as ec2 from 'aws-cdk-lib/aws-ec2';
// eslint-disable-next-line unused-imports/no-unused-imports-ts
import * as iam from 'aws-cdk-lib/aws-iam';
// eslint-disable-next-line unused-imports/no-unused-imports-ts
import * as cdk from 'aws-cdk-lib';
import { readFileSync } from 'fs';
// import { Construct } from 'constructs';

export class StarterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 create VPC in which we'll launch the Instance
    const vpc = new ec2.Vpc(this, 'my-cdk-vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 0,
      subnetConfiguration: [{ cidrMask: 24, name: 'public', subnetType: ec2.SubnetType.PUBLIC }],
    });
    // 👇 create Security Group for the Instance
    const webserverSG = new ec2.SecurityGroup(this, 'webserver-sg', {
      allowAllOutbound: true,
      vpc,
    });

    webserverSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow SSH access from anywhere');
    webserverSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'allow HTTP traffic from anywhere');
    webserverSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'allow HTTPS traffic from anywhere');
    // 👇 create a Role for the EC2 Instance
    const webserverRole = new iam.Role(this, 'webserver-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')],
    });
    // 👇 create the EC2 Instance
    const ec2Instance = new ec2.Instance(this, 'ec2-instance', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      keyName: 'zsgg-ec2',
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      role: webserverRole,
      securityGroup: webserverSG,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    // 👇 load contents of script
    const userDataScript = readFileSync('./lib/user-data.sh', 'utf8');
    // 👇 add the User Data script to the Instance
    ec2Instance.addUserData(userDataScript);
  }
}
