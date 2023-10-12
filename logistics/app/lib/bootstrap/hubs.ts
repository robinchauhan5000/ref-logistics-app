const env = process.env.NODE_ENV || 'development'; // By default development environment is picked
// default users fordevelopment and staging/production environment
const hubs =
  env === 'development'
    ? [
        //Delhi
        {
          name: 'Wits Hub Chandigarh',
          status: 'Active',
          serviceablePincode: [140301, 160055, 160056],
          addressDetails: {
            location: {
              coordinates: ['30.748882', '76.641357'],
            },
            building: '123 Main Street',
            city: 'Kharar',
            state: 'Punjab',
            country: 'India',
            locality: '',
            pincode: '140301',
          },
        },
        {
          name: 'Wits Hub Delhi',
          status: 'Active',
          serviceablePincode: [110001, 110002, 110003, 110004, 110005, 110006, 110015],
          addressDetails: {
            location: {
              coordinates: [28.613895, 77.209006],
            },
            building: '123 Main Street',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India',
            locality: '',
            pincode: '110001',
          },
        },
        //Mumbai
        {
          name: 'Wits Hub Mumbai',
          status: 'Active',
          serviceablePincode: [400001, 400012, 400053, 411001, 440001, 422001, 431001, 400601, 416001, 413001],
          addressDetails: {
            location: {
              coordinates: [19.07609, 72.877426],
            },
            building: '456 Park Avenue',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            locality: '',
            pincode: '400001',
          },
        },
        //Kolkata
        {
          name: 'Wits Hub Kolkata',
          status: 'Active',
          serviceablePincode: [700001, 700027, 700009, 711101, 734001, 734101, 713201, 713301, 742101, 732101],
          addressDetails: {
            location: {
              coordinates: [22.572645, 88.363892],
            },
            building: '789 River Road',
            city: 'Kolkata',
            state: 'West Bengal',
            country: 'India',
            locality: '',
            pincode: '700001',
          },
        },
        // Chennai
        {
          name: 'Wits Hub Chennai',
          status: 'Active',
          serviceablePincode: [600001, 600035, 600101, 641001, 625001, 620001, 636001, 638001, 632001, 613001],
          addressDetails: {
            location: {
              coordinates: [13.08268, 80.270721],
            },
            building: '101 Beach Road',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            locality: '',
            pincode: '600001',
          },
        },
        //Bangalore
        {
          name: 'Wits Hub Bangalore',
          status: 'Active',
          serviceablePincode: [560001, 560068, 560032, 570001, 575001, 580020, 590001, 585101, 576101, 580001],
          addressDetails: {
            location: {
              coordinates: [12.971599, 77.594566],
            },
            building: '234 Garden Street',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            locality: '',
            pincode: '560001',
          },
        },
        // Hyderabad
        {
          name: 'Wits Hub Hyderabad',
          status: 'Active',
          serviceablePincode: [500001, 500050, 500090, 506002, 505001, 503001, 507001, 504001, 509001, 508001],
          addressDetails: {
            location: {
              coordinates: [17.385044, 78.486671],
            },
            building: '567 Lake View Road',
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
            locality: '',
            pincode: '500001',
          },
        },
        //jaipur
        {
          name: 'Wits Hub Jaipur',
          status: 'Active',
          serviceablePincode: [302001, 302018, 342001, 313001, 324001, 305001, 334001, 301001, 345001, 332001],
          addressDetails: {
            location: {
              coordinates: [26.912434, 75.787271],
            },
            building: '321 Castle Lane',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            locality: '',
            pincode: '302001',
          },
        },
        // Ahmedabad
        {
          name: 'Wits Hub Ahmedabad',
          status: 'Active',
          ServiceablePincode: [380001, 380015, 395001, 390001, 360001, 382010, 364001, 361001, 362001, 388001],
          addressDetails: {
            location: {
              coordinates: [23.022505, 72.571365],
            },
            building: '456 Riverfront Drive',
            city: 'Ahmedabad',
            state: 'Gujarat',
            country: 'India',
            locality: '',
            pincode: '380001',
          },
        },
        // Lucknow
        {
          name: 'Wits Hub Lucknow',
          status: 'Active',
          serviceablePincode: [226001, 208001, 282001, 221001, 211001, 201001, 201301, 250001, 202001, 243001],
          addressDetails: {
            location: {
              coordinates: [26.846694, 80.946166],
            },
            building: '101 City Center',
            city: 'Lucknow',
            state: 'Uttar Pradesh',
            country: 'India',
            locality: '',
            pincode: '226001',
          },
        },
        // Kochi
        {
          name: 'Wits Hub Kochi',
          status: 'Active',
          ServiceablePincode: [682001, 682011, 682017, 682031, 682301, 682030, 683101, 682024, 682019, 682002],
          addressDetails: {
            location: {
              coordinates: [9.9312, 76.2673],
            },
            building: '456 Riverfront Drive',
            city: 'Kochi',
            state: 'Kerala',
            country: 'India',
            locality: '',
            pincode: '380001',
          },
        },
        // Srinagar
        {
          name: 'Wits Hub Srinagar',
          status: 'Active',
          ServiceablePincode: [190001, 190006, 193101, 192101, 192301, 192231, 192303, 193222, 191201, 193502],
          addressDetails: {
            location: {
              coordinates: [34.0837, 74.7973],
            },
            building: '456 Riverfront Drive',
            city: 'Srinagar',
            state: 'J&K',
            country: 'India',
            locality: '',
            pincode: '190001',
          },
        },
        //Guwahati
        {
          name: 'Wits Hub Guwahati',
          status: 'Active',
          ServiceablePincode: [781001, 795001, 796001, 793001, 799001, 797001, 791111, 788001, 785001],
          addressDetails: {
            location: {
              coordinates: [26.1445, 91.7362],
            },
            building: '456 Riverfront Drive',
            city: 'Guwahati',
            state: 'Assam',
            country: 'India',
            locality: '',
            pincode: '781001',
          },
        },
      ]
    : [
      //Delhi
      {
        name: 'Wits Hub Chandigarh',
        status: 'Active',
        serviceablePincode: [140301, 160055, 160056],
        addressDetails: {
          location: {
            coordinates: ['30.748882', '76.641357'],
          },
          building: '123 Main Street',
          city: 'Kharar',
          state: 'Punjab',
          country: 'India',
          locality: '',
          pincode: '140301',
        },
      },
      {
        name: 'Wits Hub Delhi',
        status: 'Active',
        serviceablePincode: [110001, 110002, 110003, 110004, 110005, 110006, 110015],
        addressDetails: {
          location: {
            coordinates: [28.613895, 77.209006],
          },
          building: '123 Main Street',
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
          locality: '',
          pincode: '110001',
        },
      },
      //Mumbai
      {
        name: 'Wits Hub Mumbai',
        status: 'Active',
        serviceablePincode: [400001, 400012, 400053, 411001, 440001, 422001, 431001, 400601, 416001, 413001],
        addressDetails: {
          location: {
            coordinates: [19.07609, 72.877426],
          },
          building: '456 Park Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          locality: '',
          pincode: '400001',
        },
      },
      //Kolkata
      {
        name: 'Wits Hub Kolkata',
        status: 'Active',
        serviceablePincode: [700001, 700027, 700009, 711101, 734001, 734101, 713201, 713301, 742101, 732101],
        addressDetails: {
          location: {
            coordinates: [22.572645, 88.363892],
          },
          building: '789 River Road',
          city: 'Kolkata',
          state: 'West Bengal',
          country: 'India',
          locality: '',
          pincode: '700001',
        },
      },
      // Chennai
      {
        name: 'Wits Hub Chennai',
        status: 'Active',
        serviceablePincode: [600001, 600035, 600101, 641001, 625001, 620001, 636001, 638001, 632001, 613001],
        addressDetails: {
          location: {
            coordinates: [13.08268, 80.270721],
          },
          building: '101 Beach Road',
          city: 'Chennai',
          state: 'Tamil Nadu',
          country: 'India',
          locality: '',
          pincode: '600001',
        },
      },
      //Bangalore
      {
        name: 'Wits Hub Bangalore',
        status: 'Active',
        serviceablePincode: [560001, 560068, 560032, 570001, 575001, 580020, 590001, 585101, 576101, 580001],
        addressDetails: {
          location: {
            coordinates: [12.971599, 77.594566],
          },
          building: '234 Garden Street',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          locality: '',
          pincode: '560001',
        },
      },
      // Hyderabad
      {
        name: 'Wits Hub Hyderabad',
        status: 'Active',
        serviceablePincode: [500001, 500050, 500090, 506002, 505001, 503001, 507001, 504001, 509001, 508001],
        addressDetails: {
          location: {
            coordinates: [17.385044, 78.486671],
          },
          building: '567 Lake View Road',
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          locality: '',
          pincode: '500001',
        },
      },
      //jaipur
      {
        name: 'Wits Hub Jaipur',
        status: 'Active',
        serviceablePincode: [302001, 302018, 342001, 313001, 324001, 305001, 334001, 301001, 345001, 332001],
        addressDetails: {
          location: {
            coordinates: [26.912434, 75.787271],
          },
          building: '321 Castle Lane',
          city: 'Jaipur',
          state: 'Rajasthan',
          country: 'India',
          locality: '',
          pincode: '302001',
        },
      },
      // Ahmedabad
      {
        name: 'Wits Hub Ahmedabad',
        status: 'Active',
        ServiceablePincode: [380001, 380015, 395001, 390001, 360001, 382010, 364001, 361001, 362001, 388001],
        addressDetails: {
          location: {
            coordinates: [23.022505, 72.571365],
          },
          building: '456 Riverfront Drive',
          city: 'Ahmedabad',
          state: 'Gujarat',
          country: 'India',
          locality: '',
          pincode: '380001',
        },
      },
      // Lucknow
      {
        name: 'Wits Hub Lucknow',
        status: 'Active',
        serviceablePincode: [226001, 208001, 282001, 221001, 211001, 201001, 201301, 250001, 202001, 243001],
        addressDetails: {
          location: {
            coordinates: [26.846694, 80.946166],
          },
          building: '101 City Center',
          city: 'Lucknow',
          state: 'Uttar Pradesh',
          country: 'India',
          locality: '',
          pincode: '226001',
        },
      },
      // Kochi
      {
        name: 'Wits Hub Kochi',
        status: 'Active',
        ServiceablePincode: [682001, 682011, 682017, 682031, 682301, 682030, 683101, 682024, 682019, 682002],
        addressDetails: {
          location: {
            coordinates: [9.9312, 76.2673],
          },
          building: '456 Riverfront Drive',
          city: 'Kochi',
          state: 'Kerala',
          country: 'India',
          locality: '',
          pincode: '380001',
        },
      },
      // Srinagar
      {
        name: 'Wits Hub Srinagar',
        status: 'Active',
        ServiceablePincode: [190001, 190006, 193101, 192101, 192301, 192231, 192303, 193222, 191201, 193502],
        addressDetails: {
          location: {
            coordinates: [34.0837, 74.7973],
          },
          building: '456 Riverfront Drive',
          city: 'Srinagar',
          state: 'J&K',
          country: 'India',
          locality: '',
          pincode: '190001',
        },
      },
      //Guwahati
      {
        name: 'Wits Hub Guwahati',
        status: 'Active',
        ServiceablePincode: [781001, 795001, 796001, 793001, 799001, 797001, 791111, 788001, 785001],
        addressDetails: {
          location: {
            coordinates: [26.1445, 91.7362],
          },
          building: '456 Riverfront Drive',
          city: 'Guwahati',
          state: 'Assam',
          country: 'India',
          locality: '',
          pincode: '781001',
        },
      },
    ];

export default hubs;
