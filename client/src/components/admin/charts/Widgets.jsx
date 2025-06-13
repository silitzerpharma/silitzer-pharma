import './widgets.scss'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { NavLink } from 'react-router-dom';




const Widgets = ({title, link, linktext, count ,icon ,newPercentageChange}) => {
  return (
    <div className='widget' >
        <div className='left' >
            <span className='title' >{title}</span>
            <span className='count'> {count} </span>
            <NavLink to={link} className="link">{linktext} </NavLink> 
        </div>
        <div className='right'>
            <div className='precentage positive'>
                {newPercentageChange > 0 ? (
        <KeyboardArrowUpIcon style={{ color: 'green' }} />
      ) : newPercentageChange < 0 ? (
        <KeyboardArrowDownIcon style={{ color: 'red' }} />
      ) : null}

      <span style={{ margin: '0 4px' }}>{newPercentageChange}%</span>
            </div>

           {icon}
        </div>

    </div>
  )
}

export default Widgets