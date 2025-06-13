import './widgets.scss'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { NavLink } from 'react-router-dom';




const StockWidget = ({stockData}) => {


 if (!stockData) {
    // Show a placeholder or loading state if stockData is not ready
    return <div className='widget'>Loading stock data...</div>;
  }

  return (
    <div className='widget' >
        <div className='left' >
            <span className='title' >Today Stock Transaction</span>
            <span className='count'>  <KeyboardArrowUpIcon/> {stockData.outStock}  <KeyboardArrowDownIcon/> {stockData.inStock} </span>
            <NavLink to={'stocktransaction'} className="link"> see transaction  </NavLink> 
        </div>
        <div className='right'>
            <div className='precentage positive'>
                <KeyboardArrowUpIcon/>
                 10% 
            </div>

           <ShowChartIcon className='icon'/>
        </div>

    </div>
  )
}

export default StockWidget