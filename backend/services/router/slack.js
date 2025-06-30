exports.routeToSlack = (doc) => {
  // Simulate Slack notification
  return { message: `Document ${doc.id} sent to Slack for manual review`, destination: 'Slack' };
}; 