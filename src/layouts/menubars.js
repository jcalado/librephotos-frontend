import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Popup,Menu, Input, Icon, Sidebar,Dropdown, Divider, Image, Header, Segment } from 'semantic-ui-react';
import { connect } from "react-redux";
import {login, logout} from '../actions/authActions'
import {searchPhotos,searchPeople,searchPlaceAlbums,searchThingAlbums} from '../actions/searchActions'
import {fetchExampleSearchTerms} from '../actions/utilActions'
import { push } from 'react-router-redux'
import store from '../store'
import jwtDecode from 'jwt-decode'

var ENTER_KEY = 13;
var topMenuHeight = 55 // don't change this

export class TopMenu extends Component {
  state = {
    searchText:'',
    warningPopupOpen:false,
    showEmptyQueryWarning:false,
    width:window.innerWidth,
    exampleSearchTerm:'Search...',
    searchBarFocused: false
  }

  constructor(props) {
    super(props)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleResize = this.handleResize.bind(this)
    this._handleKeyDown = this._handleKeyDown.bind(this)
  }

  handleResize() {
    this.setState({width:window.innerWidth})
  }


  componentWillMount() {
      this.props.dispatch(fetchExampleSearchTerms())
      window.addEventListener('resize',this.handleResize.bind(this))
      this.exampleSearchTermCylcer = setInterval(()=>{
        this.setState({exampleSearchTerm:  'Search ' + this.props.exampleSearchTerms[Math.floor(Math.random()*this.props.exampleSearchTerms.length)]})
      },5000)
  }

  componentWillUnmount() {
      window.removeEventListener('resize',this.handleResize.bind(this))
  }

  _handleKeyDown (event) {
      switch( event.keyCode ) {
          case ENTER_KEY:
              this.props.dispatch(searchPhotos(this.state.searchText))
              this.props.dispatch(push('/search'))
              break;
          default: 
              break;
      }
  }


  handleSearch(e,d) {
    if (this.state.searchText.length > 0){
      this.props.dispatch(searchPhotos(this.state.searchText))
      this.props.dispatch(searchPeople(this.state.searchText))
      this.props.dispatch(searchThingAlbums(this.state.searchText))
      this.props.dispatch(searchPlaceAlbums(this.state.searchText))
      this.props.dispatch(push('/search'))
    } else {
      this.setState({ warningPopupOpen: true,showEmptyQueryWarning:true })
      this.timeout = setTimeout(() => {
        this.setState({ warningPopupOpen: false,showEmptyQueryWarning:true })
      }, 2500)
    }
  }

  handleChange(e,d) {
    this.state.searchText = d.value
  }

  render() {
    var searchBarWidth = this.state.width > 600 ? this.state.width - 400 : this.state.width - 130
    // var searchBarWidth =  this.state.width - 130
    return (
      <Menu style={{height:topMenuHeight,padding:10,contentAlign:'left',backgroundColor:'#eeeeee'}} borderless fixed='top' size='small' widths={1}>

          <div style={{paddingLeft:28,width:(window.innerWidth-searchBarWidth)/2,left:0,position:'absolute',textAlign:'left'}}>
          <img src="/logo.png" style={{height:35}}/>
          </div>

          <div style={{width:searchBarWidth,paddingRight:10,paddingLeft:10}}>
          <Popup trigger={
            <div>
              <Input 
                list='exampleSearchTerms'
                fluid
                onFocus={()=>{
                  this.setState({searchBarFocused:true})
                  console.log('searchbar focused')
                  console.log('searchbar focused', this.state.searchBarFocused)

                }}
                onBlur={()=>{
                  this.setState({searchBarFocused:false})
                  console.log('searchbar unfocused', this.state.searchBarFocused)
                }}
                onChange={this.handleChange}
                action={{ 
                  icon: 'search', 
                  color:'blue',
                  loading:this.props.searchingPhotos, 
                  onClick:this.handleSearch,
                }} 
                placeholder={this.state.exampleSearchTerm}/>
              <datalist id="exampleSearchTerms">
                {this.props.exampleSearchTerms.map((el)=>(<option value={el}/>))}
              </datalist>    
            </div>}
            inverted
            open={this.state.warningPopupOpen}
            position='bottom left'
            content={
              this.state.showEmptyQueryWarning ? 
              ("Search query cannot be empty!") :
              ("You can search for people, location, and things.")
            }/>
          </div>

          { this.state.searchBarFocused && 
            <div style={{
              paddingTop:5,
              paddingLeft:10,
              paddingRight:10,
              width:searchBarWidth,
              top:topMenuHeight-10,
              left:(this.state.width-searchBarWidth)/2,
              position:'absolute'}}>
              <Segment raised style={{height:window.innerHeight/2}}>
                Search Suggestions
              </Segment>
            </div>
          }

          <div style={{paddingRight:20,paddingTop:8,width:(window.innerWidth-searchBarWidth)/2,right:0,position:'absolute',textAlign:'right'}}>
          
          <b>
            <Dropdown icon='user' inline pointing='top right'>
              <Dropdown.Menu>
                <Dropdown.Item onClick={()=>this.props.dispatch(logout())}>
                  <Icon name='sign out' /><b>Logout</b>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </b>
          </div>

      </Menu>
    )  
  }
}



export class SideMenuNarrow extends Component {
  state = { activeItem: 'all photos' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })
  handleLogout = (e, {name}) => this.props.dispatch(logout())

  render() {

      var authMenu = (
        <Menu.Item 
          onClick={this.handleLogout}
          name='loginout'>
          <Popup 
            inverted
            size='mini'
            position='right center'
            content="Sign out"
            trigger={
              <Icon name='sign out' corner />}/>
        </Menu.Item>
      )
    

    const { activeItem } = this.state
    return (
      <Menu 
        borderless 
        icon='labeled'
        vertical 
        fixed='left' 
        floated 
        pointing 
        width='thin'>

        <Menu.Item name='logo'>
          <img height={40} src='/logo.png'/>
        </Menu.Item>


        <Menu.Item 
          onClick={this.handleItemClick}
          active={'/'===this.props.location.pathname}
          name='all photos'
          as={Link}
          to='/'>
          <Popup 
            inverted
            size='mini'
            position='right center'
            content="All Photos"
            trigger={
            <Icon.Group size='big'>
              <Icon name='camera' />
              <Icon corner name='info circle' color='green' />
            </Icon.Group>
            }/>
        </Menu.Item>


        <Menu.Item 
          onClick={this.handleItemClick}
          active={this.props.location.pathname.startsWith('/notimestamp')}
          name='no timestamp photos'
          as={Link}
          to='/notimestamp'>
          <Popup 
            inverted
            size='mini'
            position='right center'
            content="Photos without timestamps"
            trigger={
              <Icon.Group size='big'>
                <Icon name='camera' />
                <Icon corner name='info circle' color='red' />
              </Icon.Group>
            }/>
        </Menu.Item>


        <Divider hidden/>


        <Menu.Item
          onClick={this.handleItemClick}
          active={this.props.location.pathname.startsWith('/people') || this.props.location.pathname.startsWith('/person')}
          name='people'
          as={Link}
          to='/people'>
          <Popup 
            inverted
            size='mini'
            position='right center'
            content="People"
            trigger={
            <Icon name='users' />}/>
        </Menu.Item>

        <Menu.Item
          onClick={this.handleItemClick}
          active={this.props.location.pathname.startsWith('/thing') }
          name='things'
          as={Link}
          to='/things'>
          <Popup 
            inverted
            size='mini'
            position='right center'
            content="Things"
            trigger={
              <Icon name='tags' />}/>
        </Menu.Item>


        <Menu.Item
          onClick={this.handleItemClick}
          active={this.props.location.pathname.startsWith('/place')}
          name='places'
          as={Link}
          to='/places'>
          <Popup 
            inverted
            size='mini'
            position='right center'
            content="Places"
            trigger={
            <Icon name='map outline' />}/>
        </Menu.Item>




        <Menu.Item
          onClick={this.handleItemClick}
          active={this.props.location.pathname.startsWith('/event')}
          name='auto albums'
          as={Link}
          to='/events'>
          <Popup 
            inverted
            size='mini'
            position='right center'
            content="Events"
            trigger={
              <Icon name='wizard' />}/>
        </Menu.Item>




        <Divider hidden/>

        <Menu.Item
          onClick={this.handleItemClick}
          active={this.props.location.pathname.startsWith('/statistics')}
          name='statistics'
          as={Link}
          to='/statistics'>
          <Popup 
            inverted
            size='mini'
            position='right center'
            content="Cool Graphs"
            trigger={
            <Icon name='bar chart' />}/>
        </Menu.Item>

        <Menu.Item
          onClick={this.handleItemClick}
          active={this.props.location.pathname.startsWith('/faces')}
          name='faces'
          as={Link}
          to='/faces'>
          <Popup 
            inverted
            size='mini'
            position='right center'
            content="Face Dashboard"
            trigger={
            <Icon name='user circle outline' />}/>
        </Menu.Item>


        <Menu.Item
          onClick={this.handleItemClick}
          active={this.props.location.pathname.startsWith('/setting')}
          name='settings'
          as={Link}
          to='/settings'>
          <Popup 
            inverted
            size='mini'
            position='right center'
            content="Settings"
            trigger={
            <Icon name='options' />}/>
        </Menu.Item>

        <Divider hidden/>

        {authMenu}

      </Menu>
    )
  }
}


export class SideMenu extends Component {
  state = { activeItem: 'photos' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })
  handleLogout = (e, {name}) => this.props.dispatch(logout())

  render() {
    if (this.props.jwtToken == null) {
      console.log('signed out')
      var authMenu = (
        <Menu.Item 
          name='loginout'
          as={Link}
          to='/login'>
          <Icon name='sign out' corner /> Log In
        </Menu.Item>
      )
    }
    else {
      var authMenu = (
        <Menu.Item 
          onClick={this.handleLogout}
          name='loginout'
          as={Link}
          to='/login'>
          <Icon name='sign in' corner /> Log Out
        </Menu.Item>
      )
    }


    const { activeItem } = this.state
    return (
        <Sidebar
          as={Menu}
          
          vertical
          fixed='left'
          width='thin'
          color='black'
          animation="overlay"
          floated
          pointing          
          borderless
          inverted>

          <Menu.Item name='logo'>
            <img src='/logo-white.png'/>
          </Menu.Item>

          {authMenu}

          <Menu.Item 
            onClick={this.handleItemClick}
            active={activeItem==='all photos'}
            name='all photos'
            as={Link}
            to='/'>
            <Icon name='image' corner />Browse
          </Menu.Item>


          <Menu.Item 
            onClick={this.handleItemClick}
            active={activeItem==='search'}
            name='search'
            as={Link}
            to='/search'>
            <Icon name='search' corner />Search
          </Menu.Item>


          <Menu.Item>
            <Menu.Header><Icon name='heart'/>Favorites</Menu.Header>
            <Menu.Menu>     
            <Menu.Item
              onClick={this.handleItemClick}
              active={activeItem==='favorites auto albums'}
              name='favorites auto albums'
              content="Events"
              as={Link}
              to='/favorite/auto'/>
            </Menu.Menu>
          </Menu.Item>


          <Menu.Item>
            <Menu.Header><Icon name='image'/>Albums</Menu.Header>
            <Menu.Menu>
              <Menu.Item
                onClick={this.handleItemClick}
                active={activeItem==='people albums'}
                content='People'
                name='people albums'
                as={Link}
                to='/albums/people'/>
              <Menu.Item
                onClick={this.handleItemClick}
                active={activeItem==='auto albums'}
                content="Events"
                name='auto albums'
                as={Link}
                to='/albums/auto'/>
              <Menu.Item
                onClick={this.handleItemClick}
                active={activeItem==='date albums'}
                content="Days"
                name='date albums'
                as={Link}
                to='/albums/date'/>
            </Menu.Menu>
          </Menu.Item>

          <Menu.Item>
            <Menu.Header><Icon name='dashboard'/>Dashboards</Menu.Header>
            <Menu.Menu>            
            <Menu.Item
              onClick={this.handleItemClick}
              active={activeItem==='faces dashboard'}
              name='faces dashboard'
              content='Faces'
              as={Link}
              to='/faces'/>
            <Menu.Item
              onClick={this.handleItemClick}
              active={activeItem==='people dashboard'}
              name='people dashboard'
              content='People'
              as={Link}
              to='/people'/>

            <Menu.Item
              onClick={this.handleItemClick}
              active={activeItem==='statistics'}
              name='statistics'
              content="Statistics"
              as={Link}
              to='/statistics'/>
            </Menu.Menu>
          </Menu.Item>
        </Sidebar>
    )
  }
}




SideMenu = connect((store)=>{
  return {
    jwtToken: store.auth.jwtToken
  }
})(SideMenu)

TopMenu = connect((store)=>{
  return {
    auth: store.auth,
    jwtToken: store.auth.jwtToken,
    exampleSearchTerms: store.util.exampleSearchTerms,
    searchError: store.search.error,
    searchingPhotos: store.search.searchingPhotos,
    searchedPhotos: store.search.searchedPhotos
  }
})(TopMenu)

SideMenuNarrow = connect((store)=>{
  return {
    jwtToken: store.auth.jwtToken,
    location: store.routerReducer.location
  }
})(SideMenuNarrow)
