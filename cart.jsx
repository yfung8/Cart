// simulate getting products from DataBase
const products = [
  { name: 'Apples', country: 'Italy', cost: 3, instock: 10 },
  { name: 'Oranges', country: 'Spain', cost: 4, instock: 3 },
  { name: 'Beans', country: 'USA', cost: 2, instock: 5 },
  { name: 'Cabbage', country: 'USA', cost: 1, instock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log('useEffect Called');
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });
      try {
        const result = await axios(url);
        console.log('FETCH FROM URl');
        if (!didCancel) {
          // result.data.data
          // first data is from axios object, second data is from strapi object
          dispatch({ type: 'FETCH_SUCCESS', payload: result.data.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState('http://localhost:1337/api/products');
  const [{ data, isLoading, isError }, doFetch] = useDataApi('http://localhost:1337/api/products', {
    data: [],
  });
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    if (item[0].instock == 0) return;
    item[0].instock = item[0].instock - 1;
    console.log(`add to Cart ${JSON.stringify(item)}`);
    setCart([...cart, ...item]);
  };
  const deleteCartItem = (delIndex) => {
    let newCart = cart.filter((item, i) => delIndex != i);
    let target = cart.filter((item, index) => delIndex == index);
    let newItems = items.map((item, index) => {
      if (item.name == target[0].name) item.instock = item.instock + 1;
      return item;
    });
    setCart(newCart);
    setItems(newItems);
  };

  let list = items.map((item, index) => {
    let n = index + 1049;
    let url = `https://picsum.photos/id/${n}/50/50`;
  
    return (
      <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <Image src={url} width={50} height={50} roundedCircle style={{ marginRight: '10px' }} />
        <div style={{ flexGrow: 1 }}>
          <Button variant="dark" size="large" style={{ width: '90%'}}>
            {item.name} ${item.cost} Stock: {item.instock}
          </Button>
        </div>
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });
''
  let cartList = cart.map((item, index) => {
    return (
      <Accordion.Item key={1+index} eventKey={1 + index}>
        <Accordion.Header>
         {item.name}
        </Accordion.Header>
        <h3><Accordion.Body onClick={() => deleteCartItem(index)}
          eventKey={1 + index}>
          $ {item.cost} from {item.country} - Click to Remove from Cart
        </Accordion.Body></h3>
      </Accordion.Item>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          <h3>{item.name}</h3>
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };

  const restockProducts = async (url) => {
    try {
      const result = await axios(url);
      let newItems = result.data.data.map((item) => {
        let { name, country, cost, instock } = item.attributes;
        return { name, country, cost, instock };
      });
      setItems((prevItems) => [...prevItems, ...newItems]);
    } catch (error) {
      console.error('Error fetching restocked items:', error);
    }
  };

  const handleCheckOut = () => {
    alert('Check Out Complete');
    // Reset the state to the initial state or fetch the data again
    setItems(products);
    setCart([]);
    setTotal(0);
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={12} md={4}>
          <h2>Product List </h2>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col xs={12} md={4}>
          <h2>Cart Contents</h2>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col xs={12} md={4} className="text-center" >
  <h2>CheckOut</h2>
  <Button onClick={handleCheckOut} style={{ width: '70%' }} variant="dark">
    CheckOut $ {finalList().total}
  </Button>
  <div> {finalList().total > 0 && finalList().final} </div>
</Col>
      </Row>
       <Row>
       <Col xs={12} className="d-flex justify-content-center" style={{ paddingTop: '20px' }}>
  <form
    onSubmit={(event) => {
      restockProducts(`http://localhost:1337/api/products`);
      console.log(`Restock called on http://localhost:1337/api/products`);
      event.preventDefault();
    }}
  >
    <input
      type="text"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
    />
    <button type="submit">ReStock Products</button>
  </form>
</Col>
      </Row>
    </Container>
  );
};

// Render the Products Component
ReactDOM.render(<Products />, document.getElementById("root"));
