export const categoryOptions = ['Labour', 'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Driver', 'Cook', 'Maid', 'Security Guard', 'Delivery', 'Mechanic', 'AC Technician', 'Refrigerator Technician', 'Construction Worker', 'Helper', 'Salesman', 'Office Staff', 'Event Staff', 'Other'];

export const workerProfiles = [
  { id: 'w1', name: 'Rajesh Kumar', category: 'Electrician', distance: '1.8 km', experience: '4+ Years', rating: 4.7, reviews: 62, available: true, verified: true, price: '₹600-₹800 / day', location: 'Katihar' },
  { id: 'w2', name: 'Sanjay Paswan', category: 'Plumber', distance: '2.4 km', experience: '5 years', rating: 4.5, reviews: 48, available: true, verified: true, price: '₹500-₹1,000 / day', location: 'Katihar' },
  { id: 'w3', name: 'Mo. Ismail', category: 'Painter', distance: '3.1 km', experience: '4.6 Years', rating: 4.6, reviews: 39, available: true, verified: true, price: '₹500-₹900 / day', location: 'Katihar' },
];

export const jobPosts = [
  { id: 'j1', title: '2 मजदूर चाहिए (सामान उठाना)', employer: 'Shivam Construction', area: 'Katihar, Court Road', distance: '1.5 km', salary: '₹700 / दिन', jobType: 'Daily', postedAt: 'आज', category: 'Labour' },
  { id: 'j2', title: 'घर की वायरिंग के लिए Electrician', employer: 'Singh Residence', area: 'Katihar, 3.2 km', distance: '3.2 km', salary: '₹600 - ₹1,000 / दिन', jobType: 'Part Time', postedAt: '2 दिन पहले', category: 'Electrician' },
];

export const defaultProfile = {
  name: 'Rahul Kumar',
  phone: '+91 98765 43210',
  location: 'Katihar, Bihar',
  verified: true,
  profileCompletion: 72,
  about: 'मैं एक कुशल श्रमिक हूँ, जो मेहनत और सही काम के लिए معروف हूँ।',
  skills: ['Labour', 'Electrician', 'Plumber'],
};
