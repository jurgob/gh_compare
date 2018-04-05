import React, { Component } from 'react';
import './App.css';
import Collapsible from 'react-collapsible';

const superagent     = require('superagent')
const Throttle    = require('superagent-throttle')

let throttle = new Throttle({
  active: true,     // set false to pause queue
  rate: 5,          // how many requests can be sent every `ratePer`
  ratePer: 10000,   // number of ms in which `rate` requests may be sent
  concurrent: 2     // how many requests can be sent concurrently
})

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div>
          <GHPage />
        </div>
      </div>
    );
  }
}

const addProject = (prj) => (state) => {
  return {
    ...state,
    projects: [...state.projects, prj]
  }
}

class GHPage extends Component {
  constructor(){
    super()
    this.state = {
      projects_ids: [],
      projects:[],
      title:""
    }
  }

  componentDidMount(){
    const title = getParameterByName('title')
    const projects_ids_str = getParameterByName('projects_ids')
    const projects_ids = projects_ids_str.split(',')
    this.setState({title})
    this.setState({projects_ids})
    projects_ids
      .forEach(repo => {
        superagent
          .get(`https://api.github.com/repos/${repo}`)
          .use(throttle.plugin())
          .then((res) => {
            this.setState(addProject(res.body))
          })
      })

  }

  render(){
    return (
      <div  >
        <h1>{this.state.title}</h1>
        <div  style={{textAlign:"left", maxWidth: "820px", display:"inline-block"}} >
          <GHProjectList projects={this.state.projects} />
          <Collapsible trigger="Click to see api response">
            <pre style={{backgroundColor:"#ddd"}} >{JSON.stringify(this.state.projects, null, '  ')}</pre>
          </Collapsible>
        </div>
      </div>
    )
  }
}

const GHProjectList = ({projects}) => {
  const tableData = Object.values(projects)
      .filter(repo => !!repo.name)
      .sort((a,b) => {
        return  b.stargazers_count - a.stargazers_count
      })
      .map(repo => {
        return (
          <div key={repo.name}>
            <img height="40px" src={repo.owner && repo.owner.avatar_url} role="presentation" />
            <a href={repo.html_url}>{repo.name}</a> <br />
            Stars: {repo.stargazers_count} Issues: {repo.open_issues} <br />
            <br /><br />
          </div>
        )
      })
    console.log(tableData)

  return (
    <div>
      {tableData}
    </div>
  )

}

export default App;
