const fs = require('fs')
const path = require('path')

class ManifestWebpackPlugin {
  constructor(options) {
    this.options = options
  }

  readPackageJson() {
    return JSON.parse(fs.readFileSync(this.options.packageJsonPath).toString())
  }

  readManifest() {
    return JSON.parse(fs.readFileSync(this.options.manifestPath).toString())
  }

  writeManifest(manifest) {
    fs.writeFileSync(
      path.join(this.options.outputDir, 'manifest.json'),
      JSON.stringify(manifest)
    )
  }

  updateManifest(manifest) {
    const packageJson = this.readPackageJson()

    manifest.version = packageJson.version
    manifest.oauth2.client_id = process.env.MANIFEST_OAUTH2_CLIENT_ID
    if (!this.options.production) {
      manifest.key = process.env.MANIFEST_LOCAL_PUBLIC_KEY
    }
  }

  apply(compiler) {
    compiler.hooks.done.tap('ManifestWebpackPlugin', (stats) => {
      const manifest = this.readManifest()
      this.updateManifest(manifest)
      this.writeManifest(manifest)
    })
  }
}

module.exports = ManifestWebpackPlugin
