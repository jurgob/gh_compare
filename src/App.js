import React, { Component } from 'react';
import './App.css';
// import Collapsible from 'react-collapsible';
import FunctionalComponent from 'react-functional-component';

var limit = require("simple-rate-limiter");


function funcFactory(func, to=2, per=1000){
  var _f = (resolve, fail, ...args) => {
    return func(...args)
      .then(res =>resolve(res))
      .catch(err => fail(err))
  }
  var resolvePromise = limit(_f).to(to).per(per);
  return (...args) => {
    return new Promise((resolve, fail) => {
        resolvePromise(resolve, fail, ...args)
    })

  }
}

var fetchLimited = funcFactory(fetch, 2, 1000)



function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[[\]]/g, "\\$&");
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
    const title = getParameterByName('title') || ''
    const projects_ids_str = getParameterByName('projects_ids') || ''
    const projects_ids = projects_ids_str ? projects_ids_str.split(',') : []
    this.setState({title})
    this.setState({projects_ids})
    projects_ids
      .forEach(repo => {
        console.log(repo)
        fetchLimited(`https://api.github.com/repos/${repo}`)
          .then(res => res.json())
          .then((res) => {
            console.log()
            this.setState(addProject(res))
          })
      })

  }

  render(){
    return (
      <div  >
        <h1>Git Hub Repo Comparison</h1>
        <h2>{this.state.title}</h2>
        <div  style={{textAlign:"left", maxWidth: "820px", display:"inline-block"}}  >
          {/* <OrderHeader
              headers={[{header:"Star", value:"stargazers_count"}, {header:"Name", value:"name"}   ]}
              selectedValue="stargazers_count"
              onClick={(val) => {}}
          />
          <GHProjectList projects={this.state.projects} />
          <Collapsible style={{textDecoration:"underline"}} trigger="Click to see api response  V ">
            <pre style={{backgroundColor:"#ddd"}} >{JSON.stringify(this.state.projects, null, '  ')}</pre>
          </Collapsible> */}
          <FunctionalComponent
            initialState={{initial: "state"}}
            componentDidMount={ ({setState}) =>  {
              setState({componentDidMount: "componentDidMount"})
            }}

          >
            {({setState, state}) => {
              return (
                <div>
                  Be Functional, Be Lazy: {state && JSON.stringify(state)} <br />
                  <a onClick={() => {
                    !state.onClick
                      ? setState({onClick:"onClick"})
                      : setState((state) => {
                          delete state["onClick"]
                          return state
                        }) }}
                  >Click here!</a>
                </div>
              )
            }}

          </FunctionalComponent>
          <div>
            <h3>Instruction: </h3>
            to use this set the following params: <br />
            <b>projects_ids: </b> a list of github project ids, divided by coma (e.g. projects_ids=Khan/aphrodite,martinandert/babel-plugin-css-in-js) <br />
            <b>title: </b> a random string (e.g. title=css-in-line)<br />
            <br />
            <a href="?projects_ids=Khan/aphrodite,martinandert/babel-plugin-css-in-js&title=css-in-line">Click here for an example</a>
          </div>
        </div>
      </div>
    )
  }
}




// const Separator = () => (<span> | </span>)

// const OrderHeader = ({headersValues, selectedValue, onClick}) => {
//
//   const HeaderElemet = ({h,idx}) => ( <span className={ (h.value === selectedValue) ? "OHEl-selected" : "OHEl" }  key={idx} onClick={() => onClick(h.value)} > {h.header}  </span>    )
//
//   const addSeparators = (acc, el, idx) => {
//       if(idx === 0 ){
//         return [...acc, el]
//       } else {
//         return [...acc, (<Separator/>) , el]
//       }
//   }
//
//   const headerElements = headersValues
//     .map((h, idx) => <HeaderElemet idx={idx} h={h} />)//value to jsx
//     .reduce(addSeparators, [])
//
//   return (
//     <div>
//       {headerElements}
//     </div>
//   )
// }

// const GHProjectList = ({projects}) => {
//   const tableData = Object.values(projects)
//       .filter(repo => !!repo.name)
//       .sort((a,b) => {
//         return  b.stargazers_count - a.stargazers_count
//       })
//       .map(repo => {
//         return (
//           <div key={repo.name}>
//             <img height="40px" src={repo.owner && repo.owner.avatar_url} alt={repo.name} />
//             <a href={repo.html_url}>{repo.name}</a> <br />
//             Stars: {repo.stargazers_count} Issues: {repo.open_issues} <br />
//             <br /><br />
//           </div>
//         )
//       })
//
//   return (
//     <div>
//       {tableData}
//     </div>
//   )
//
// }

export default App;
