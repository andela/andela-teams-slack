# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Visual representation of analytics on feedback [@chieze-franklin](https://github.com/chieze-franklin).

## [1.0.0] - 2019-02-18
### Added
- Change text of the `Create Team` button to `Create Team...` [@chieze-franklin](https://github.com/chieze-franklin).

### Changed
- Write here.

### Removed
- Write here.

### Fixed
- Write here.

## [0.2.0] - 2019-02-11
### Added
- Click the `Mark as feedback...` menu action to record feedback.
- The app now has a database of `D0A` and `D0B` skills (matched to their corresponding attributes).
- Feedback instances and URLs of repos/projects that have been in the database for 4 months or more will be auto-deleted.

### Changed
- `:add_me:` reaction now works on only URLs of repos/projects created using this app. This is to avoid abuse of this feature.

## [0.1.0] - 2019-01-28
### Added
- Run the `/team` or `/teams` command to get started.
- Click the `Create Team` button to see the __Create Team__ dialog.
- Submitting the __Create Team__ dialog presents you buttons containing suggested names of Github repos and Pivotal Tracker projects. Clicking any of the buttons creates the repo/project with the name appearing on the button.
- To create a repo/project with custom settings, click the `Custom...` buttons.
- To join (or leave) a repo/project, react (or _unreact_) to the URL of the repo/project with the `:add_me:` emoji.
