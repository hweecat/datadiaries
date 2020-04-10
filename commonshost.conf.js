module.exports = () => ({
  https: {
    port: 4433
  },
  http: {
    redirect: false
  },
  hosts: [
    {
      domain: 'datadiaries.dev',
	  directories: {
        trailingSlash: 'never'
      },
      fallback: {
        200: 'app.html'
      },
      manifest: 'serverpush.json'
    },
	{
      domain: 'datadiaries.commons.host',
	  directories: {
        trailingSlash: 'never'
      },
      fallback: {
        200: 'app.html'
      },
      manifest: 'serverpush.json'
    }
  ]
})
