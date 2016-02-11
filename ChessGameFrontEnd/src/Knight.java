import java.util.ArrayList;

public class Knight extends Piece  {

	public int x = 0;
	public int y = 0;
	public String color = "";
	public String type = "N";
	public boolean isActive = true;
	
	public Knight(int x, int y, String color) {
		this.x = x;
		this.y = y;
		this.color = color;
		// TODO Auto-generated constructor stub
	}
	
	public ArrayList<ArrayList<Integer>> getMoves() {
		int diffRow = Math.abs(x - this.x);
	    int diffCol = Math.abs(y - this.y);
	    
	    if ((diffRow == 2 && diffCol == 1) || (diffRow == 1 && diffCol == 2)) {
	        //return true;
	    }
	    
	    return null;
	}

	public int getX() {
		return x;
	}

	public void setX(int x) {
		this.x = x;
	}

	public int getY() {
		return y;
	}

	public void setY(int y) {
		this.y = y;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public String getType() {
		return type;
	}

	public boolean isActive() {
		return isActive;
	}

	public void setActive(boolean isActive) {
		this.isActive = isActive;
	}

}