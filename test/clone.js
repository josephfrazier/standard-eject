/**
 * Clones several projects that are known to follow "JavaScript Standard Style" and runs
 * the `standard` style checker to verify that it passes without warnings. This helps
 * ensure we don't accidentally introduce new style rules that cause previously "good"
 * code to start failing with new warnings! (And if we do, then that needs to be a MAJOR
 * VERSION BUMP.)
 */

const crossSpawn = require('cross-spawn')
const fs = require('fs')
const minimist = require('minimist')
const mkdirp = require('mkdirp')
const os = require('os')
const parallelLimit = require('run-parallel-limit')
const path = require('path')
const standardPackages = require('standard-packages')
const test = require('tape')

const GIT = 'git'
const STANDARD = path.join(__dirname, '..', 'node_modules', '.bin', 'standardx')
const TMP = path.join(__dirname, '..', 'tmp')
const PARALLEL_LIMIT = os.cpus().length

const argv = minimist(process.argv.slice(2), {
  boolean: [
    'disabled',
    'offline',
    'quick',
    'quiet'
  ]
})

let testPackages = argv.quick
  ? standardPackages.test.slice(0, 20)
  : standardPackages.test

const failsWithStandardx = [
  'auto-changelog',
  'babel-plugin-istanbul',
  'bitmidi.com',
  'co-mocha',
  'create-torrent',
  'dotenv',
  'electron-mocha',
  'fastify',
  'front-matter',
  'fs-extra',
  'fs-writefile-promise',
  'humanize-duration',
  'instant.io',
  'jsonfile',
  'karma-cli',
  'pino',
  'tap',
  'testdouble',
  'webtorrent-desktop'
]
testPackages.forEach(pkg => {
  if (failsWithStandardx.includes(pkg.name)) {
    pkg.disable = true
  }
})

const disabledPackages = []
testPackages = testPackages.filter(pkg => {
  if (pkg.disable) disabledPackages.push(pkg)
  return !pkg.disable
})

if (argv.disabled) {
  testPackages = disabledPackages
} else {
  test('Disabled Packages', t => {
    disabledPackages.forEach(({ name, disable, repo }) => {
      console.log(`DISABLED: ${name}: ${disable} (${repo})`)
    })
    t.end()
  })
}

test('test github repos that use `standard`', t => {
  t.plan(testPackages.length)

  mkdirp.sync(TMP)

  parallelLimit(testPackages.map(pkg => {
    const name = pkg.name
    const url = `${pkg.repo}.git`
    const folder = path.join(TMP, name)
    return cb => {
      fs.access(path.join(TMP, name), fs.R_OK | fs.W_OK, err => {
        if (argv.offline) {
          if (err) {
            t.pass(`SKIPPING (offline): ${name} (${pkg.repo})`)
            return cb(null)
          }
          runStandard(cb)
        } else {
          downloadPackage(err => {
            if (err) return cb(err)
            runStandard(cb)
          })
        }

        function downloadPackage (cb) {
          if (err) gitClone(cb)
          else gitPull(cb)
        }

        function gitClone (cb) {
          const args = ['clone', '--depth', 1, url, path.join(TMP, name)]
          spawn(GIT, args, { stdio: 'ignore' }, err => {
            if (err) err.message += ` (git clone) (${name})`
            cb(err)
          })
        }

        function gitPull (cb) {
          const args = ['pull']
          spawn(GIT, args, { cwd: folder, stdio: 'ignore' }, err => {
            if (err) err.message += ` (git pull) (${name})`
            cb(err)
          })
        }

        function runStandard (cb) {
          try {
            const packageJson = require(path.join(folder, 'package.json'))

            const devDependencies = packageJson.devDependencies
            const dependencies = packageJson.dependencies

            const notInDevDependences = (devDependencies && !('standard' in devDependencies))
            const notInDependencies = (dependencies && !('standard' in dependencies))

            if (notInDevDependences && notInDependencies) {
              t.pass(`DOES NOT USE STANDARD: ${pkg.name} (${pkg.repo})`)
              return cb(null)
            }
          } catch (err) {
            console.log(`COULD NOT FIND PACKAGE.JSON: ${pkg.name} (${pkg.repo})`)
          }

          const args = ['--verbose']
          if (pkg.args) args.push.apply(args, pkg.args)
          const STANDARD_EJECT = path.join(__dirname, '..', 'bin', 'standard-eject')
          crossSpawn.sync(STANDARD_EJECT, ['--no-install'], { cwd: folder })
          spawn(STANDARD, args, { cwd: folder }, err => {
            crossSpawn.sync(GIT, ['reset', '--hard'], { cwd: folder })
            const str = `${name} (${pkg.repo})`
            if (err) { t.fail(str) } else { t.pass(str) }
            cb(null)
          })
        }
      })
    }
  }), PARALLEL_LIMIT, err => {
    if (err) throw err
  })
})

function spawn (command, args, opts, cb) {
  if (!opts.stdio) opts.stdio = argv.quiet ? 'ignore' : 'inherit'

  const child = crossSpawn(command, args, opts)
  child.on('error', cb)
  child.on('close', code => {
    if (code !== 0) return cb(new Error(`non-zero exit code: ${code}`))
    cb(null)
  })
  return child
}
