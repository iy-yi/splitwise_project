import Axios from 'axios';
import React, {Component} from 'react';
import cookie from 'react-cookies';
import {Redirect} from 'react-router';

class AllGroup extends Component{
  state = {
    invites: [],
    groups: [],
    search: '',
    user: cookie.load('id'),
    message: '',
  };

  //get all users from backend  
  componentDidMount(){
    Axios.get('/group/all', {
      params: {
        user: cookie.load('id'),
      }
    })
    .then((response) => {
      //update the state with the response data
      console.log(response.data);
      this.setState({
        invites : response.data.user.invites,
        groups : response.data.user.groups,
      });
    })
    .catch((err) => {
      this.setState({ message: 'Data loading failed!'});
    });
  }

  searchGroup = (e) => {
    this.setState({ search: e.target.value});
  }

  acceptGroup = (e) => {
    const data = {
      group: e.target.value,
      user: this.state.user,
    };
    Axios.put('/group/accept', data)
    .then(()=> {
      this.setState({ message: 'Join group successfully.' });
      this.componentDidMount();
    })
    .catch((err) => {
      console.log(err);
      this.setState({ message: 'Join group failed!'});
    })
  }

  leaveGroup = (e) => {
    const data = {
      group: e.target.value,
      user: this.state.user,
    };
    Axios.post('/group/leave', data)
    .then(()=> {
      this.setState({ message: 'Leave group successfully.' });
      this.componentDidMount();
    })
    .catch((err) => {
      this.setState({ message: 'Failed: OPEN_BALANCE' });
    })
  }

  render(){
    if (!cookie.load('user')) {
      return <Redirect to="/landing" />;
    }
    let allGroup = this.state.groups.filter((group)=> {
      if (group.name.toLowerCase().includes(this.state.search.toLowerCase())) {
        return group;
      }
    })
    .map((group) => {
      return(
        <tr>
          <td><a href={"/group/expense/"+ group._id}>{group.name}</a></td>
          <td>                                
            <button type="button" class="btn btn-secondary btn-sm" value={group._id} onClick={(e)=>this.leaveGroup(e)}>Leave</button>                
          </td>
        </tr>
      )      
    });

    let invites = this.state.invites.map((invite) => {
      return(
          <tr>
            <td>{invite.name}</td>
            <td>                                
              <button type="button" class="btn btn-secondary btn-sm" value={invite._id} onClick={(e)=>this.acceptGroup(e)}>Accept</button>                
            </td>
          </tr>
      )      
    });    

    return(
      <div className="container-fluid">
        <h3>My Groups</h3>
        { this.state.message!=='' && <div class="alert alert-info">{this.state.message}</div>}
 
        <a class="btn btn-info" href="/group/new">New Group</a>
        <br />
        <br />
        <table class="table table-striped">
          <h5>Pending Invites</h5>
          { this.state.invites.length === 0 && <div class="alert alert-info">No pending invites.</div>}
          <tbody>
            {invites}
          </tbody>
        </table>
        <h5>Search Group</h5>
        <input type="text" class="form-control" placeholder="Search a group" onChange={(e)=>this.searchGroup(e)} />
        <br />
        <table class="table table-striped">
          <h5>Joined Groups</h5>
          <tbody>
            {allGroup}
          </tbody>
        </table>

      </div>
    );
  }
}

export default AllGroup;