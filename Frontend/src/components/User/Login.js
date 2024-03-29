// import Axios from 'axios';
import React, {Component} from 'react';
import {Redirect} from 'react-router';
import { userLogin } from '../../redux/actions/user/loginAction';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cookie from 'react-cookies';

class Login extends Component{

  constructor(props) {
    super(props);
    this.state = { };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  submitLogin = (e) => {
    e.preventDefault();
    //this.setState({ submitted: true});
    const data = {
      email : this.state.email,
      password : this.state.password
    }
    this.props.userLogin(data);
  }

  render(){
    if (this.props && this.props.user && this.props.user._id) {
      return <Redirect to="/dashboard" />;
    }
    // // console.log('props:', this.props);
    // let message = '';
    if (this.props.user && this.props.user.email) {
      return <Redirect to= "/dashboard" />;
    }
    // else if (this.props.user === 'NO_USER') {
    //   message = 'NO_USER';
    // }
    // else if (this.props.user === 'WRONG_PASSWORD') {
    //   message = 'WRONG_PASSWORD';
    // }

    return(
      <div>
        <br/>
        <div className="container">
            <h3>Log In</h3>
              <form id="userLogin" onSubmit={this.submitLogin}>
              {/* { this.state.submitFlag === true && message!=='' && <div class="alert alert-danger">{message}</div>} */}
                <label>Email:</label><br/>
                <input className="form-control" type="email" id="email" name="email" placeholder="name@example.com" onChange={this.handleChange}/><br/>
                <label>Password:</label><br/>
                <input className="form-control" type="password" id="password" name="password" onChange={this.handleChange}/><br/>
                <input type = "submit" value = "Submit" className="btn btn-primary"/>
              </form>
        </div>
      </div>
    );
  }
}

// login component includes user object and userLogin action/function.
// define available prop types accessable in login component 
Login.propTypes = {
  userLogin: PropTypes.func.isRequired, // user login function
  user: PropTypes.object.isRequired,  // user state
}

const mapStateToProps = (state) => {
  return ({
    user: state.login.user // user in login reducer, map global state to component props
  });
};

// export default Login; // const Login = connect(null, mapDispatchToProps)(Login) mapp between props and actions
// map global state or dispatch actions to props. then they are available in props
export default connect(mapStateToProps, { userLogin})(Login);