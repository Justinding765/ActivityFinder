import React, {Component, useState, useEffect, useInsertionEffect,} from 'react';
import { Link, useNavigate } from "react-router-dom";
import Navbar_Login from './navbar/navbar-logged-in.jsx';
import Navbar_Logout from './navbar/navbar-not-logged-in.jsx';
import { ReactSession } from 'react-client-session';
import io from "socket.io-client";



// a bit of a hack to allow programatically redirecting to a react-router
// page and also pass in state
const Redirector = ({submitted, nextState}) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (submitted) {
      
      navigate('/chat', {state: nextState});
    }
  }, [submitted]);
  return null;
}

class Create_Group extends Component {
  state = {skillLevel: 0, group_name: "", loc: false, lat: 0.0, long: 0.0, 
  value: 1, activities: [], activity_id: 0, activity_name: "NULL",value: 1, submitted: false};
  //Will use client session instead of server session
  async  componentDidMount(){
    this.fetchActs();
    try{
      if(ReactSession.get("firstName")== undefined){
        window.location.replace("/")
      }
    }
    catch(e){
      window.location.replace("/")
    }
  }
//     fetch("/user",{
//       method: 'get', // or 'PUT'
//       headers: {
//         'Content-Type': 'application/json',
//         },
//       })       
//     .then((response) => response.json())
//     .then(() => {
  
        
//     })  
//     .catch((error) => {
//       window.location.replace("/home")


//     },[]);

//  }

  sendReq = (event) => {
    event.preventDefault();
    if(this.state.activity_id==0) {
      alert("Please select an activity");
      return;
    }
    const data = {
      user_id:ReactSession.get("user_id"),
      skillLevel: this.state.skillLevel,
      group_name: this.state.group_name, 
      loc: this.state.loc, 
      lat: this.state.lat, 
      long: this.state.long,
      activity_id: this.state.activity_id,
      activity_name: this.state.activity_name
    };
    //console.log(this.state.activity_id, this.state.activity_name)
    fetch("/Create_Group",{
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })       
    .then((response) => response.json())
    .then((data) => {
        ReactSession.set("Group_Members", [ReactSession.get("firstName") + " " + ReactSession.get("lastName")])
        //dictionary of all the groups the user is in, where key is group_id and value is array containg information for that 
        let object = data['messages'][0]
        let temp =  ReactSession.get("groupInfo")
        console.log(data['messages'][0])
        temp[object['group_id']] = object['group_name']
        ReactSession.set("groupInfo", temp)
        this.setState({submitted: true});
    })
    .catch((error) => {
        console.error('Error:', error);
    },[]);
  }

 /*  componentDidMount() {
    
  } */

  fetchActs() {
    console.log('fetch');
    fetch("/Create_Group")
      .then((res) => res.json())
      .then((data) => {
        this.setState({ ...data });
      });
  }

  handleSkillLevelChange = (event) => {
    this.setState({ skillLevel: parseInt(event.target.value) });
  };

  handleActivityChange = (event) => { // 
    const target = event.target;
    const value = target.value.split(",");
    this.setState({
      activity_id: parseInt(value[0]),
      activity_name: value[1]
    }); 
    
  }

  handleChange = (event) => { // handles changes for multiple text input fields
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleLoc = () => { // handles the location checkbox
    this.setState({
      loc: !this.state.loc
    });
  }

  getLocation = () => { // retrieves the user's location on button press
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        this.setState({ lat : pos.coords.latitude, long : pos.coords.longitude});
      });
    } 
  }

  render() {
  
   
      
   
    return (
      
        // <div> {this.fetchMsgs()}
        //     data['messages'] 
        // </div>
        <div className = "root">
          { /* <Navbar_Logout/> */}
          {ReactSession.get("firstName") !== undefined &&
            <Navbar_Login/>
          }
         
        <div className="bg-image position-relative" /* Style="background: #E4A11B; height: 100vh" */>
        <form onSubmit={this.sendReq} className="mb-3">
          <div className="form-group mb-3">
            <label htmlFor="activities">Activity</label>
            <select id="activities" name="activities" onChange={this.handleActivityChange}>
                <option key={0} value={"0,NULL"}> Select an Activity </option>
              {this.state.activities.map((option) => {
                return (
                  <option key={option.id} value={[option.id, option.name]}>
                    {option.name}
                  </option>
                );
              })}
            </select><br/>
            <label htmlFor="msg">Group Name:</label>
            <input
              type="text"
              className="form-control"
              name="group_name"
              value={this.state.group_name}
              onChange={this.handleChange}
            />
          </div>
          <input type="checkbox" name="loc" id="loc" checked={this.state.loc} onChange={this.handleLoc} />
          <label htmlFor="loc"> Include Location</label>
          
          { this.state.loc?
          <div>
            <div className="form-group mb-3">
              <label htmlFor="lat">Latitude:</label>
              <input
                type="number"
                className="form-control"
                name="lat"
                value={this.state.lat}
                onChange={this.handleChange}
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="long">Longitude:</label>
              <input
                type="number"
                className="form-control"
                name="long"
                value={this.state.long}
                onChange={this.handleChange}
              />
            </div>
          <button type="button" className="btn btn-primary" onClick={this.getLocation}>
            Use My Location
          </button>
          </div>
          :
          <div></div>
          }
          <label htmlFor="skill-level">Skill level:</label>
            <select name="skill-level" id="skill-level" onChange={this.handleSkillLevelChange} defaultValue={"0"}>
                <option value="0">Beginner</option>
                <option value="1">Intermediate</option>
                <option value="2">Advanced</option>
            </select>
            <br/>
            {/* <Link to="/chat" state={{props: this.state.value}} > */}
            <Redirector submitted={this.state.submitted} nextState={{props: this.state.value}} />
            <button type="submit" className="btn btn-primary "/*position-relative top-50 start-50"*/>Create Group</button>
            {/* </Link> */}
        </form>
        </div>
        </div> 
    );
  }
}



export default Create_Group