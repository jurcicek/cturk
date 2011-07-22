<?php
class PaypalComponent extends Object {
	
	/**
	 * API user: The user that is identified as making the call. you can
	 * also use your own API username that you created on PayPal抯 sandbox
	 * or the PayPal live site
	 */
	var $API_USERNAME = '';
	
	/**
	 * API_password: The password associated with the API user
	 * If you are using your own API username, enter the API password that
	 * was generated by PayPal below
	 * IMPORTANT - HAVING YOUR API PASSWORD INCLUDED IN THE MANNER IS NOT
	 * SECURE, AND ITS ONLY BEING SHOWN THIS WAY FOR TESTING PURPOSES
	 */
	var $API_PASSWORD = '';
	
	/**
	 * API_Signature:The Signature associated with the API user. 
	 * which is generated by paypal.
	 */
	var $API_SIGNATURE = '';
	
	/**
	 * Endpoint: this is the server URL which you have to connect for submitting your API request.
	 */
	
	var $API_ENDPOINT = 'https://svcs.sandbox.paypal.com/';
	
	/**
	 *USE_PROXY: Set this variable to TRUE to route all the API requests through proxy.
	 *like define('USE_PROXY',TRUE);
	 */
	var $USE_PROXY = FALSE;
	
	/**
	 *PROXY_HOST: Set the host name or the IP address of proxy server.
	 *PROXY_PORT: Set proxy port.
	 *
	 *PROXY_HOST and PROXY_PORT will be read only if USE_PROXY is set to TRUE
	 */
	var $PROXY_HOST = '127.0.0.1';
	var $PROXY_PORT = '808';
	
	// Ack related and Header constants
	var $ACK_SUCCESS = 'SUCCESS';
	var $ACK_SUCCESS_WITH_WARNING = 'SUCCESSWITHWARNING';
	var $APPLICATION_ID = 'APP-80W284485P519543T';
	var $DEVICE_ID = 'mydevice';
	var $PAYPAL_REDIRECT_URL = 'https://www.sandbox.paypal.com/webscr&cmd=';
	var $DEVELOPER_PORTAL = 'https://developer.paypal.com';
	var $LOGFILENAME = '../Log/logdata.log';
	var $DEVICE_IPADDRESS = '127.0.0.1';
	//This SDK supports only Name Value(NV) Request and Response Data Formats. for XML,SOAP,JSON use the SOAP SDK from X.com
	var $REQUEST_FORMAT = 'NV';
	var $RESPONSE_FORMAT = 'NV';
	var $X_PAYPAL_REQUEST_SOURCE = 'PHP_NVP_SDK_V1.1';
	
	/**
	 * hashCall: Function to perform the API call to PayPal using API signature
	 * @methodName is name of API  method.
	 * @nvpStr is nvp string.
	 * returns an associtive array containing the response from the server.
	 */
	
	public function hashCall($methodName, $nvpStr, $sandboxEmailAddress = '') {
		//declaring of global variables
		

		$URL = $this->API_ENDPOINT . $methodName;
		//setting the curl parameters.
		$ch = curl_init ();
		curl_setopt ( $ch, CURLOPT_URL, $URL );
		curl_setopt ( $ch, CURLOPT_VERBOSE, 1 );
		
		//turning off the server and peer verification(TrustManager Concept).
		curl_setopt ( $ch, CURLOPT_SSL_VERIFYPEER, FALSE );
		curl_setopt ( $ch, CURLOPT_SSL_VERIFYHOST, FALSE );
		
		curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, 1 );
		curl_setopt ( $ch, CURLOPT_POST, 1 );
		//if USE_PROXY constant set to TRUE in Constants.php, then only proxy will be enabled.
		//Set proxy name to PROXY_HOST and port number to PROXY_PORT in constants.php 
		if ($this->USE_PROXY)
			curl_setopt ( $ch, CURLOPT_PROXY, $this->PROXY_HOST . ":" . $this->PROXY_PORT );
		
		$headers_array = $this->setupHeaders ();
		if (! empty ( $sandboxEmailAddress )) {
			$headers_array [] = "X-PAYPAL-SANDBOX-EMAIL-ADDRESS: " . $sandboxEmailAddress;
		}
		curl_setopt ( $ch, CURLOPT_HTTPHEADER, $headers_array );
		curl_setopt ( $ch, CURLOPT_HEADER, false );
		//setting the nvpreq as POST FIELD to curl
		curl_setopt ( $ch, CURLOPT_POSTFIELDS, $nvpStr );
		
		//getting response from server
		$response = curl_exec ( $ch );
		
		//convrting NVPResponse to an Associative Array
		$nvpResArray = $this->deformatNVP ( $response );
		//$nvpReqArray = $this->deformatNVP ( $nvpreq );
		//$_SESSION ['nvpReqArray'] = $nvpReqArray;
		$nvpReqArray = $this->deformatNVP ( '' );
		$_SESSION ['nvpReqArray'] = $nvpReqArray;
		
		if (curl_errno ( $ch )) {
			// moving to display page to display curl errors
			$_SESSION ['curl_error_no'] = curl_errno ( $ch );
			$_SESSION ['curl_error_msg'] = curl_error ( $ch );
			//$location = "APIError.php";
			//header ( "Location: $location" );
			$this->showAPIError ();
		} else {
			//closing the curl
			curl_close ( $ch );
		}
		
		return $nvpResArray;
	}
	
	/** This function will take NVPString and convert it to an Associative Array and it will decode the response.
	 * It is usefull to search for a particular key and displaying arrays.
	 * @nvpstr is NVPString.
	 * @nvpArray is Associative Array.
	 */
	
	public function deformatNVP($nvpstr) {
		$intial = 0;
		$nvpArray = array ();
		
		while ( strlen ( $nvpstr ) ) {
			//postion of Key
			$keypos = strpos ( $nvpstr, '=' );
			//position of value
			$valuepos = strpos ( $nvpstr, '&' ) ? strpos ( $nvpstr, '&' ) : strlen ( $nvpstr );
			
			/*getting the Key and Value values and storing in a Associative Array*/
			$keyval = substr ( $nvpstr, $intial, $keypos );
			$valval = substr ( $nvpstr, $keypos + 1, $valuepos - $keypos - 1 );
			//decoding the respose
			$nvpArray [urldecode ( $keyval )] = urldecode ( $valval );
			$nvpstr = substr ( $nvpstr, $valuepos + 1, strlen ( $nvpstr ) );
		}
		return $nvpArray;
	}
	
	public function setupHeaders() {
		$headers_arr = array ();
		
		$headers_arr [] = "X-PAYPAL-SECURITY-SIGNATURE: " . $this->API_SIGNATURE;
		$headers_arr [] = "X-PAYPAL-SECURITY-USERID:  " . $this->API_USERNAME;
		$headers_arr [] = "X-PAYPAL-SECURITY-PASSWORD: " . $this->API_PASSWORD;
		$headers_arr [] = "X-PAYPAL-APPLICATION-ID: " . $this->APPLICATION_ID;
		$headers_arr [] = "X-PAYPAL-REQUEST-DATA-FORMAT: " . $this->REQUEST_FORMAT;
		$headers_arr [] = "X-PAYPAL-RESPONSE-DATA-FORMAT: " . $this->RESPONSE_FORMAT;
		$headers_arr [] = "X-PAYPAL-DEVICE-IPADDRESS: " . $this->DEVICE_IPADDRESS;
		
		$headers_arr [] = "X-PAYPAL-REQUEST-SOURCE: " . $this->X_PAYPAL_REQUEST_SOURCE;
		return $headers_arr;
	
	}
	
	/**
	 * Displays error parameters.
	 */
	public function showAPIError() {
		//session_start ();
		$resArray = $_SESSION ['reshash'];
		
		header ( "Content-Type: text/html; charset=utf-8" );
		$html = '';
		$html .= '
				<h2 style="height:60px; background:#FF0000; text-align:center; font:bold 20px/60px Arial; color:#FFFF00;">The PayPal API has returned an error!</h2>
		';
		//it will print if any URL errors 
		if (isset ( $_SESSION ['curl_error_no'] )) {
			$errorCode = $_SESSION ['curl_error_no'];
			$errorMessage = $_SESSION ['curl_error_msg'];
			session_unset ();
			$html .= '
			<table>
				<tr>
					<td>Error Number:</td>
					<td>' . $errorCode . '</td>
				</tr>
				<tr>
					<td>Error Message:</td>
					<td>' . $errorMessage . '</td>
				</tr>
			</table>
			';
		} else {
			/**
			 * If there is no URL Errors, Construct the HTML page with 
			 * Response Error parameters.   
			 */
			$html .= '
			<center>
			<b> PayPal API Error</b>
			<table width = "600">';
			
			foreach ( $resArray as $key => $value ) {
				$html .= "<tr><td> $key:</td><td>$value</td>";
			}
			
			$html .= '
			</table>
			</center>
			';
		}
		echo $html;
		die ();
	}
}
?>