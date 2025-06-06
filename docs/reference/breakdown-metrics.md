---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/breakdown-metrics-docs.html
---

# Breakdown metrics [breakdown-metrics-docs]

Breakdown metrics help you visualize where your application is spending the majority of its time — allowing you to find the root cause of performance problems even quicker. These metrics are calculated for each transaction based on its corresponding types.


## Page load breakdown [page-load-breakdown]

Page load transactions breakdown aligns closely with the processsing model of the [Navigation Timing API](https://www.w3.org/TR/navigation-timing/#processing-model) available in the browser. The different types of metrics are:

* `DNS` - Duration of the DNS query for the current page (domainLookupEnd - domainLookupStart).
* `TCP` - How long it took to establish the TCP connection to the server. Includes the TLS negotitaion time for HTTPS pages (connectEnd - connectStart).
* `Request` - The time elapsed between the browser making the HTTP request and receiving the first byte of the response (responseStart - requestStart). Also referred as TTFB (Time to First Byte).
* `Response` - The elapsed time between the first and the last byte of the response. Referred commonly as Content Download time (responseEnd - responseStart).
* `Processing` - Time taken to render the current page; this includes downloading necessary resources like JavaScript, Images, CSS, etc. required by the page (domComplete - domLoading).
* `Load` - Duration of the `load` event after the browser is done dowloading the document and resources required for rendering the page (loadEventEnd - loadEventStart). Duration would be longer if there are multiple listeners for the load event.


## Other transaction types [other-transaction-breakdown]

For other transactions including SPA (Single Page Application) navigations and user created ones, the breakdown metrics are calculated based on the spans associated with the transaction.

* If a SPA navigation transaction (route-change) spends 20% of the time downloading resources and 80% of the time waiting for the API call response, then the transaction breakdown would indicate time spent by span type as `resource` - 20% and `http` - 80%.
* For a transaction that has concurrent async spans, the breakdown would include the sum of time spent by each span type.

