export default class Helpers {
  formatWord(word) {
    return word.replace(/\s/g, '-').toLowerCase();
  }

  getInitials(word) {
    // b=positon w=matches any word g=repeat the word through all string
    let matches = word.match(/\b(\w)/g);
    return matches.join('').toLowerCase();
  }

  githubConventions(teamName, projectName = 'ah') {
    return [
      `${teamName}-${projectName}`, `${teamName}-${projectName}-backend`, `${teamName}-${projectName}-frontend`,
      `${projectName}-${teamName}`, `${projectName}-${teamName}-backend`, `${projectName}-${teamName}-frontend`
    ];
  }

  ptConventions(teamName, projectName = 'ah') {
    return [
      `${teamName}-${projectName}`,
      `${projectName}-${teamName}`
    ];
  }
}