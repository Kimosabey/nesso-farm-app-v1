import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FarmerDocument = HydratedDocument<Farmer>;

@Schema({ _id: false })
export class FarmerAddress {
  @Prop() state?: string;
  @Prop() district?: string;
  @Prop() taluka?: string;
  @Prop() hobli?: string;
  @Prop() city?: string;
  @Prop() village?: string;
  @Prop() town?: string;
  @Prop() pincode?: string;
  @Prop() line1?: string;
}
export const FarmerAddressSchema = SchemaFactory.createForClass(FarmerAddress);

@Schema({ _id: false })
export class IdProof {
  @Prop() type?: string;
  @Prop() number?: string;
  @Prop() imageKey?: string; // S3 key
}
export const IdProofSchema = SchemaFactory.createForClass(IdProof);

@Schema({ _id: false })
export class BankInfo {
  @Prop() accountNumber?: string;
  @Prop() ifsc?: string;
  @Prop() bankName?: string;
  @Prop() branchName?: string;
  @Prop() passbookImageKey?: string;
}
export const BankInfoSchema = SchemaFactory.createForClass(BankInfo);

@Schema({ timestamps: true, collection: 'farmers' })
export class Farmer {
  @Prop({ required: true, unique: true, index: true })
  farmerId!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true, unique: true, index: true })
  mobileNumber!: string;

  @Prop({ enum: ['M', 'F', 'Other'] })
  gender?: 'M' | 'F' | 'Other';

  @Prop()
  dob?: Date;

  @Prop()
  email?: string;

  @Prop({ enum: ['INDEPENDENT', 'FLOWER_AGENT', 'FPO'], default: 'INDEPENDENT' })
  groupAssociation!: 'INDEPENDENT' | 'FLOWER_AGENT' | 'FPO';

  @Prop({ default: false, index: true })
  isFlowerAgent!: boolean;

  @Prop({ default: 'farmer' })
  role!: string;

  @Prop({ type: FarmerAddressSchema, default: () => ({}) })
  address!: FarmerAddress;

  @Prop({ type: IdProofSchema, default: () => ({}) })
  idProof!: IdProof;

  @Prop({ type: BankInfoSchema, default: () => ({}) })
  bank!: BankInfo;

  @Prop()
  profileImageKey?: string;

  @Prop({ default: 0 })
  totalLandHolding!: number;

  @Prop({ default: 0 })
  noOfFarms!: number;

  @Prop({ type: [String], default: [] })
  selectedCrops!: string[];

  @Prop({
    enum: ['Organic', 'Conventional', 'NaturalFarming', 'GAPCertified'],
    default: 'Conventional',
  })
  productionPractice!: string;

  @Prop()
  variety?: string;

  @Prop({ default: 'en' })
  preferredLanguage!: string;

  @Prop({
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  })
  approvalStatus!: 'pending' | 'approved' | 'rejected';

  @Prop()
  approvedBy?: string;
  @Prop()
  approvedAt?: Date;
  @Prop()
  rejectionReason?: string;

  @Prop({ index: true })
  managedBy?: string;
  @Prop()
  managingEntity?: string;
  @Prop({ index: true })
  fpoId?: string;
  @Prop({ index: true })
  flowerAgentId?: string;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;

  @Prop({ default: false })
  publicTraceConsent!: boolean;
}

export const FarmerSchema = SchemaFactory.createForClass(Farmer);
FarmerSchema.index({ approvalStatus: 1, isDeleted: 1 });
