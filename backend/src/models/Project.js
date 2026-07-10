import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';


const Project = sequelize.define(
  'Project',
  {

    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },


    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },


    projectCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'project_code'
    },


    clientName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'client_name'
    },


    clientEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'client_email'
    },


    clientPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'client_phone'
    },


    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },


    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },


    budget: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false,
      defaultValue:0
    },


    contractValue: {
      type: DataTypes.DECIMAL(15,2),
      allowNull:true,
      field:'contract_value'
    },


    currency:{
  type:DataTypes.STRING(10),
  allowNull:true,
  defaultValue:'UGX'
},


    startDate:{
      type:DataTypes.DATEONLY,
      allowNull:true,
      field:'start_date'
    },


    endDate:{
      type:DataTypes.DATEONLY,
      allowNull:true,
      field:'end_date'
    },


    status:{
      type:DataTypes.ENUM(
        'planning',
        'active',
        'on_hold',
        'completed',
        'cancelled'
      ),
      defaultValue:'planning'
    },


    priority:{
      type:DataTypes.ENUM(
        'low',
        'medium',
        'high',
        'critical'
      ),
      defaultValue:'medium'
    },


    category:{
      type:DataTypes.STRING(100),
      allowNull:true
    },


    projectType:{
      type:DataTypes.ENUM(
        'residential',
        'commercial',
        'industrial',
        'infrastructure',
        'renovation'
      ),
      allowNull:true,
      field:'project_type'
    },


    siteArea:{
      type:DataTypes.DECIMAL(10,2),
      allowNull:true,
      field:'site_area'
    },


    numberOfUnits:{
      type:DataTypes.INTEGER,
      allowNull:true,
      field:'number_of_units'
    },


    numberOfFloors:{
      type:DataTypes.INTEGER,
      allowNull:true,
      field:'number_of_floors'
    },


    contractorId:{
      type:DataTypes.UUID,
      allowNull:false,
      field:'contractor_id'
    },


    siteManagerId:{
      type:DataTypes.UUID,
      allowNull:true,
      field:'site_manager_id'
    },


    accountantId:{
      type:DataTypes.UUID,
      allowNull:true,
      field:'accountant_id'
    },


    progress:{
      type:DataTypes.DECIMAL(5,2),
      defaultValue:0
    },
    completionDate: {
  type: DataTypes.DATEONLY,
  allowNull: true,
  field: 'completion_date'
},
      riskLevel: {
  type: DataTypes.ENUM(
    'low',
    'medium',
    'high'
  ),
  defaultValue: 'medium',
  field: 'risk_level'
},


    completionPercentage:{
      type:DataTypes.DECIMAL(5,2),
      defaultValue:0,
      field:'completion_percentage'
    },


    actualCost:{
      type:DataTypes.DECIMAL(15,2),
      defaultValue:0,
      field:'actual_cost'
    },


    notes:{
      type:DataTypes.TEXT,
      allowNull:true
    },


    tags:{
      type:DataTypes.JSON,
      allowNull:true
    },


    attachments:{
      type:DataTypes.JSON,
      allowNull:true
    },


    metadata:{
      type:DataTypes.JSON,
      allowNull:true
    },


    isArchived:{
      type:DataTypes.BOOLEAN,
      defaultValue:false,
      field:'is_archived'
    }

  },


  {

    tableName:'projects',

    timestamps:true,

    paranoid:true,

    createdAt:'created_at',

    updatedAt:'updated_at',

    deletedAt:'deleted_at'

  }

);


export default Project;