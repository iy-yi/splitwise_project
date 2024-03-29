import Axios from 'axios';
import React, {Component} from 'react';
import moment from 'moment-timezone'; 
import {Redirect} from 'react-router';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user/profileAction';

class Profile extends Component{
  constructor(props) {
    super(props);
    this.state = {
      disabled: true,
      error: '',
      fileSelected: '',
      saveStatus: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleFileSelect = this.handleFileSelect.bind(this);
    this.submitSave = this.submitSave.bind(this);
  }

  componentWillMount() {
    // this.props.getUser();
    const { user } = this.props;
    const userData = {
      id: user._id || this.state.id,
      name: user.name || this.state.name,
      email: user.email || this.state.email,
      avatar: user.avatar || this.state.avatar,
      phone: user.phone || this.state.phone,
      language: user.language || this.state.language,
      currency: user.currency || this.state.currency,
      timezone: user.timezone || this.state.timezone,
    }
    this.setState(userData);  
  }

  componentWillReceiveProps(nextProps) { // nextProps is the prop and actually the global state
    if (nextProps.user) {
      const { user } = nextProps;
      console.log(user);
      const userData = {
        id: user._id || this.state.id,
        name: user.name || this.state.name,
        email: user.email || this.state.email,
        avatar: user.avatar || this.state.avatar,
        phone: user.phone || this.state.phone,
        language: user.language || this.state.language,
        currency: user.currency || this.state.currency,
        timezone: user.timezone || this.state.timezone,
      }
      this.setState(userData);
    }
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleFileSelect = event => {
    this.setState({
      fileSelected: event.target.files[0]
    });
  }

  handleValidation() {
    const phone = this.state.phone;
    let isValid = true;
    const phonePattern  = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/; 
    if (!phonePattern.test(phone)) {
      isValid = false;
      alert('Invalid phone number!');
    } 
    return isValid;
  }

  submitSave = async(e) => {
    e.preventDefault();
    if (this.handleValidation()) {
      try {
        // update data
        const updateData = {
          id: this.state.id,
          name: this.state.name,
          email: this.state.email,
          phone: this.state.phone,
          avatar: this.state.avatar,
          language: this.state.language,
          timezone: this.state.timezone,
          currency: this.state.currency,
          token: this.props.token,
        }

        if (this.state.fileSelected != '') {
          const data = new FormData();
          data.append('file', this.state.fileSelected);
          // data.append('ID', this.props.user._id);
          const res = await Axios.post('/user/uploadFile', data);

          // console.log(res);
          updateData.avatar = res.data;
          this.setState({avatar: res.data});
          await this.props.updateUser(updateData);
        }
        
        else {
          this.props.updateUser(updateData);
        }
        
        this.setState({ saveStatus: true, disabled: true, error: '', });
        }
      catch (e) {
        // console.log(e);
        this.setState({saveStatus: false,
          error: 'Profile save failed.',});
      }
    }
  }

  handleEditClick = () => {
    const editStatus = !this.state.disabled;
    this.setState({ disabled: editStatus});
  }

  render(){
    if (!this.props || !this.props.user || !this.props.user._id) {
      return <Redirect to="/landing" />;
    }
    const timeZones = moment.tz.names().map((name) => {
      return(
      <option value={name} key={name}>{name}</option>
      )
    });
    return(
      <div className="container-fluid">
        <h3>Your account</h3>
        <form id="profile" onSubmit={this.submitSave}>
        { this.state.error !== '' && <div class="alert alert-danger">{this.state.error}</div>}
          <div className = "row">
            <div className="col-md-4 border-right">
              <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                <img src= {this.state.avatar} width="200" /> 
                <p>Change your avatar</p>
                <input type="file" onChange={this.handleFileSelect} accept="image/*"/>
              </div>
            </div>
            <div className="col-md-4">
              <label>Name:</label><br/>
              <input className="form-control" type="text" id="name" name="name" value={this.state.name} disabled={this.state.disabled} onChange={this.handleChange}/><br/>
              <label>Email:</label><br/>
              <input className="form-control" type="email" id="email" name="email" value={this.state.email} disabled="true" onChange={this.handleChange}/><br/>
              <label>Phone Number:</label><br/>
              <input className="form-control" type="tel" id="phone" name="phone" value={this.state.phone} disabled={this.state.disabled} onChange={this.handleChange}/><br/> 
            </div>
            <div className="col-md-4">
              <label>Default currency:</label><br/>
              <select className="form-control" name="currency" id="currency" value={this.state.currency} disabled={this.state.disabled} onChange={this.handleChange}>
                <option value="USD">USD</option>
                <option value="KWD">KWD</option>
                <option value="BHD">BHD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
              </select><br/>
              <label>Time zone:</label><br/>
              <select className="form-control" name="timezone" id="timezone" value={this.state.timezone} disabled={this.state.disabled} onChange={this.handleChange}>
                {timeZones}
              </select><br/>               
              <label>Language:</label><br/>
              <select className="form-control" name="language" id="language" value={this.state.language} disabled={this.state.disabled} onChange={this.handleChange}>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
              </select><br/>              
              <input type = "button" value = "Edit" className="btn btn-secondary btn-lg" onClick={this.handleEditClick}/>
              &nbsp;&nbsp;&nbsp;
              <input type = "submit" value = "Save" className="btn btn-success btn-lg"/>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

Profile.propTypes = {
  // getUser: PropTypes.func.isRequired,
  updateUser: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  token: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  user: state.login.user,
  token: state.login.token
});

export default connect(mapStateToProps, { updateUser })(Profile);