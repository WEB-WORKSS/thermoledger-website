// CloudFront Function (viewer request) for an S3 origin: /product -> /product/index.html, /product/ -> /product/index.html
// Configure the distribution's custom error response: 403/404 -> /404.html with response code 404.
function handler(event) {
  var req = event.request;
  var uri = req.uri;
  if (uri.endsWith('/')) req.uri = uri + 'index.html';
  else if (!uri.split('/').pop().includes('.')) {
    return { statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value: uri + '/' + (req.querystring && Object.keys(req.querystring).length ? '?' + Object.keys(req.querystring).map(function (k) { return k + '=' + req.querystring[k].value; }).join('&') : '') } } };
  }
  return req;
}
