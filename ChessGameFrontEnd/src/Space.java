import java.util.ArrayList;

public class Space extends Piece  {

	public int x = 0;
	public int y = 0;
	public String color = "_";
	public String type = "_";
	public boolean isActive = true;
	
	public Space(int x, int y) {
		this.x = x;
		this.y = y;
		// TODO Auto-generated constructor stub
	}
	
	public ArrayList<ArrayList<Integer>> getMoves() {
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