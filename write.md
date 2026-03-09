I wanna build backend project for realstate compony called awali,to make me manage buildings data and it must have a professional fully featured CRM system, here i main features I need:
1- manage buildings data like the followin ng:
{
"\_id": "65f0c8e3c9b3a12f9c123456",

"unitNumber": "101",

"buildingType": "65f0c8e3d9b3a12f9c123456",
"unitType": "65f0c8e3c9bfa12f9c123456",

"description": {
"en": "Villa description here",
"ar": "وصف الفيلا هنا"
},

"status": "available",
"// status enum": [
"available // unit can be reserved or purchased",
"reserved // temporarily reserved for a client",
"sold // fully sold",
"unavailable // not open for sale",
"maintenance // under maintenance or renovation"
],

"price": {
"amount": 450000,
"currency": "SAR"
},

"area": {
"plot": 350,
"built": 280,
"unit": "sqm"
},
"// area.unit enum": [
"sqm // square meters",
"sqft // square feet"
],

"specifications": {
"bedrooms": 4,
"bathrooms": 3,
"floors": 2
},

"facade": "north",
"// facade enum": [
"north",
"south",
"east",
"west",
"north_east",
"north_west",
"south_east",
"south_west"
],

"images": [
{
"url": "https://example.com/images/villa1.jpg",
"alt": {
"en": "Front view",
"ar": "الواجهة الأمامية"
},
"isPrimary": true,
"order": 1
},
{
"url": "https://example.com/images/villa1-interior.jpg",
"alt": {
"en": "Living room",
"ar": "غرفة المعيشة"
},
"isPrimary": false,
"order": 2
}
],

"hasVirtualTour": false,

"publication": {
"isPublished": true,
"publishedAt": "2026-03-09T10:00:00.000Z"
},

"features": [
{
"featureId": "65f0c8e3c9bfa12f9c888888",
"order": 1,
"value": true
}
],

"map": {
"svgElementId": "villa-A-101"
},

"createdAt": "2026-03-09T10:00:00.000Z",
"updatedAt": "2026-03-09T10:00:00.000Z"
}

here is dynamic attributes json structure (it should have sparated CRUD operations that have relations with buildings collection):

- buildingType:[
  {
  "\_id": "65f0c8e3c9b3a12f9c123456",
  "nameAr":"",
  "nameen":"",
  "createdAt": "2026-03-09T10:00:00.000Z",
  "updatedAt": "2026-03-09T10:00:00.000Z"
  }
  ]

- unitType:[
  {
  "\_id": "65f0c8e3c9b3a12f9c123456",
  "nameAr":"",
  "nameen":"",
  "createdAt": "2026-03-09T10:00:00.000Z",
  "updatedAt": "2026-03-09T10:00:00.000Z"
  }
  ]

needed features for buildings:
- I wanna now what is most fetched or searched buildings

when user make fetch to one building, or when make search on a specific building you should save this action to help me what is most interests
 buildings

other system requirments:
1- we have two roles :
1.1 super admin "that have all permission"
1.2 admin "super admin will give him just permissions he want", so you should make a professional permissions managment on all endpoints
note: make a separated table for create roles, I wanna roles be dynmaic not just admin and super admin, so I wanna a table for roles with structure like this:
{
    nameEn: "",
    nameAr:"", 
    permissions:{

    },
    isActive:boolean
}
this is an example for wanted structure

3- a fully featured and professional and helpfull CRM system
4- a professional and helpfull anaysis
